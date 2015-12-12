angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, Auth, $ionicPopup, $rootScope, $timeout) {

  var ref = new Firebase("https://ionicmobilechat.firebaseio.com");

  $scope.showSignUpArea = false;
  $scope.showLoginArea = false;

  $scope.signUpEmail = '';
  $scope.signUpPassword = '';
  $scope.loginEmail = '';
  $scope.loginPassword = '';


  $scope.updateVal = function(inputField, value){
    switch (inputField){
      case 'signUpEmail':
        $scope.signUpEmail = value;
        break;
      case 'signUpPassword':
        $scope.signUpPassword = value;
        break;
      case 'loginEmail':
        $scope.loginEmail = value;
        break;
      case 'loginPassword':
        $scope.loginPassword = value;
        break;
      // case 'all':
      //   $scope.signUpEmail = '';
      //   $scope.signUpPassword = '';
      //   $scope.loginEmail = '';
      //   $scope.loginPassword = '';
      //   break;
    }
  }

  $scope.signup = function(authMethod, signUpEmail, signUpPassword) {
    console.log($scope.signUpEmail);
    switch(authMethod){
      case 'email':
        Auth.$createUser({
          email: signUpEmail,
          password: signUpPassword
        }).then(function(userData) {
          Auth.$authWithPassword({
            email    : signUpEmail,
            password : signUpPassword
          }, function(error, authData) {
            if (error) {
              showAlert(error);
            } else {
              console.log("Authenticated successfully with payload:", authData);
            }
          });
        }).catch(function(error) {
          showAlert(error);
        });
        break;
      case 'github':
        Auth.$authWithOAuthRedirect(authMethod).then(function(authData) {
          console.log('logged in');
        }).catch(function(error) {
          if (error.code === 'TRANSPORT_UNAVAILABLE') {
            Auth.$authWithOAuthPopup(authMethod).then(function(authData) {
              console.log('logged in');
            });
          } else {
            showAlert(error)
          }
        });
        break;
    }
  };

  $scope.login = function(authMethod, loginEmail, loginPassword) {
    console.log('here');
    switch(authMethod){
      case 'email':
        Auth.$authWithPassword({
          email    : loginEmail,
          password : loginPassword
        }, function(error, authData) {
          if (error) {
            showAlert(error);
          } else {
            console.log("Authenticated successfully with payload:", authData);
          }
        });
        break;
      case 'github':
        Auth.$authWithOAuthRedirect(authMethod).then(function(authData) {
          console.log('logged in')
        }).catch(function(error) {
          if (error.code === 'TRANSPORT_UNAVAILABLE') {
            Auth.$authWithOAuthPopup(authMethod).then(function(authData) {
              console.log('logged in');
            });
          } else {
            showAlert(error);
          }
        });
        break;
      }
  };

  // user is authorized - redirect to dashboard
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

  // error handling
  // An alert dialog
  var showAlert = function(error) {
    console.log(error, $scope.signUpEmail);
    var alertPopup = $ionicPopup.alert({
      title: 'Oops',
      template: error
    });
    alertPopup.then(function(res) {
      console.log(res);
    });
  };

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
