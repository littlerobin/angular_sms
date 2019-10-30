module.exports=function(growlProvider) {
    growlProvider.globalDisableCountDown(true);
    growlProvider.globalTimeToLive({success: 30000, error: 30000, warning: 30000, info: 30000});
};