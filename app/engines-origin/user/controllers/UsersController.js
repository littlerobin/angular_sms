angular.module('callburnApp').controller('UsersController', 
	[ 		'$scope', '$rootScope', '$state', 'Restangular', 'timezones',
	function($scope,   $rootScope,   $state,   Restangular,   timezones){
		
		
	
	$rootScope.currentPage = 'edit-account';
	$scope.userEditableData = {
		company_name : $rootScope.currentUser.company_name,
		last_name : $rootScope.currentUser.last_name,
		vat : $rootScope.currentUser.vat,
		address : $rootScope.currentUser.address,
		timezone : $rootScope.currentUser.timezone
	}

	$scope.verificationCall = {};
	$scope.isVerificationCallMade = false;
	$scope.successMessage = false;
	$scope.errorMessage = false;
	$scope.timezones = timezones.resource.timezones;
	$scope.showPaymentModal = false;
	$scope.editPasswordData = {};
	$scope.editEmailData = {};
	$scope.updatePasswordErrorMessage = false;
	$scope.updateEmailErrorMessage = false;
	$scope.editAccountMainSuccessMessage = false;
	$scope.editAccountMainErrorMessage = false;
	$scope.creditRechargeErrorMessage = false;

	$scope.sendVerificationCall = function(){
		Restangular.all('verifications/send-verification-code').post($scope.verificationCall).then(function(data){
			if(data.resource.error.no == 0){
				$scope.isVerificationCallMade = true;
				$scope.successMessage = $rootScope.trans('verification_call_made');
				$scope.errorMessage = false;
			} else{
				$scope.errorMessage = data.resource.error.text;
				$scope.successMessage = false;
			}
		});
	}

	$scope.checkVerificationCode = function(){
		Restangular.all('users/add-caller-id').post($scope.verificationCall).then(function(data){
			if(data.resource.error.no == 0){
				$scope.reloadUsersData();
				$scope.verificationCall = {};
				$scope.isVerificationCallMade = false;
				$scope.successMessage = 'Verified and added';
				$scope.errorMessage = false;
			} else{
				$scope.errorMessage = data.resource.error.text;
				$scope.successMessage = false;
			}
		})
	}

	$scope.openRemoveNumberModal = function(id){
		$scope.numberIdToBeRemoved = id;
		$scope.showRemoveNumberConfirmationModal = true;
	}

	$scope.closeRemoveNumberModal = function(){
		$scope.numberIdToBeRemoved = null;
		$scope.showRemoveNumberConfirmationModal = false;
	}

	$scope.makePayment = function(){
		Restangular.all('billings/make-payment').post($scope.rechargeData).then(function(data){
			if(data.resource.error.no == 0){
				$scope.showPaymentModal = false;
				$scope.rechargeData = {};
				$scope.editAccountMainSuccessMessage = 'Balance was recharged';
				$scope.reloadUsersData();
			} else{
				$scope.creditRechargeErrorMessage = data.resource.error.text;
			}
		})
	}

	$scope.removeNumber = function(id){
		Restangular.all('users/remove-number').post({id: id}).then(function(data){
			if(data.resource.error.no == 0){
				$scope.showRemoveNumberConfirmationModal = false;
				$scope.reloadUsersData();
			} else{

			}
		});
	}

	$scope.reloadUsersData = function(){
		Restangular.one('users/show-user').get().then(function(data){
			if(data.resource.user_data){
				$rootScope.currentUser = data.resource.user_data;
			}
		})
	}

	$scope.editPassword = function(){
		Restangular.all('users/update-password').post($scope.editPasswordData).then(function(data){
			if(data.resource.error.no == 0){
				$scope.showEditPasswordModal = false;
				$scope.editAccountMainSuccessMessage = 'Password has been successfully changed';
				$scope.editPasswordData = {};
			} else{
				$scope.updatePasswordErrorMessage = data.resource.error.text;
			}
		});
	}

	$scope.editEmail = function(){
		Restangular.all('users/update-email').post($scope.editEmailData).then(function(data){
			if(data.resource.error.no == 0){
				$scope.showEditEmailModal = false;
				$scope.editAccountMainSuccessMessage = 'Email has been successfully changed';
				$scope.editEmailData = {};
			} else{
				$scope.updateEmailErrorMessage = data.resource.error.text;
			}
		});
	}

	$scope.editMainDetails = function(){
		Restangular.all('users/update-main-data').post($scope.userEditableData).then(function(data){
			if(data.resource.error.no == 0){
				$scope.editAccountMainSuccessMessage = 'Account data updated';
			} else{
				$scope.editAccountMainErrorMessage = data.resource.error.text;
			}
		})
	}
}]);