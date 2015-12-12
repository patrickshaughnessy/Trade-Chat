angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, Auth) {

  var ref = new Firebase("https://ionicmobilechat.firebaseio.com");

  $scope.showSignUpArea = false;
  $scope.showLoginArea = false;

  $scope.signup = function(authMethod, signUpEmail, signUpPassword) {
    $scope.message = null;
    $scope.error = null;
    switch(authMethod){
      case 'email':
        Auth.$createUser({
          email: signUpEmail,
          password: signUpPassword
        }).then(function(userData) {
          $scope.message = "User created with uid: " + userData.uid;
          Auth.$authWithPassword({
            email    : signUpEmail,
            password : signUpPassword
          }, function(error, authData) {
            if (error) {
              console.log("Login Failed!", error);
            } else {
              console.log("Authenticated successfully with payload:", authData);
            }
          });
        }).catch(function(error) {
          $scope.error = error;
        });
        break;
      case 'github':
        Auth.$authWithOAuthRedirect(authMethod).then(function(authData) {
        }).catch(function(error) {
          if (error.code === 'TRANSPORT_UNAVAILABLE') {
            Auth.$authWithOAuthPopup(authMethod).then(function(authData) {
            });
          } else {
            console.log(error);
          }
        });
        break;
    }

  };

  $scope.login = function(authMethod, loginEmail, loginPassword) {
    $scope.message = null;
    $scope.error = null;
    switch(authMethod){
      case 'email':
        Auth.$authWithPassword({
          email    : loginEmail,
          password : loginPassword
        }, function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            console.log("Authenticated successfully with payload:", authData);
          }
        });
        break;
      case 'github':
        Auth.$authWithOAuthRedirect(authMethod).then(function(authData) {
        }).catch(function(error) {
          if (error.code === 'TRANSPORT_UNAVAILABLE') {
            Auth.$authWithOAuthPopup(authMethod).then(function(authData) {
            });
          } else {
            console.log(error);
          }
        });
        break;
      }
  };

  Auth.$onAuth(function(authData) {
    if (authData) {
      console.log("Logged in as:", authData);
      switch (authData.provider) {
        case 'password':
          ref.child("users").child(authData.uid).set({
            provider: authData.provider,
            email: authData.password.email
          });
          break;
        case 'github':
          ref.child("users").child(authData.uid).set({
            provider: authData.provider,
            name: authData.github.displayName
          });
          break;
      }
      $state.go('tab.dash')
    } else {
      console.log("Logged out");
    }
  });

})

.controller('DashCtrl', function($scope, $state) {
  var ref = new Firebase("https://ionicmobilechat.firebaseio.com");
  $scope.logout = function(){
    ref.unauth();
    $state.go('login');
  }
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
