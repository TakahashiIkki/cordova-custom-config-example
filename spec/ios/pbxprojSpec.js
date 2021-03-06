/**
 * Modules
 */
var path = require('path');
var fs = require('fs');
var xcode = require('xcode');

var fileHelper = require(path.resolve('spec/helper/file.js'))();


var context = fileHelper.getFakeCordovaContext();
var fileUtils = require(path.resolve('plugins/cordova-custom-config/hooks/fileUtils.js'))(context);

/**
 * Globals
 */
var projectName = fileUtils.getProjectName();
var pbxprojPath = 'platforms/ios/'+projectName+'.xcodeproj/project.pbxproj';

if(!fileHelper.fileExists(pbxprojPath)){
    console.warn("iOS pbxproj not found at "+path.resolve(pbxprojPath));
    return;
}

var pbxproj, buildConfig, debugBlock, releaseBlock;

describe("cordova-custom-config iOS pbxproj output", function() {

    beforeAll(function(done) {
        fileHelper.restoreOriginaliOSConfig();
        fileHelper.runCordova('prepare ios', function(err, stdout, stderr){

            pbxproj = xcode.project(pbxprojPath);
            pbxproj = pbxproj.parseSync();
            buildConfig = pbxproj.pbxXCBuildConfigurationSection();

            for(var block in buildConfig){
                if(buildConfig[block].name == 'Debug'){
                    debugBlock = buildConfig[block].buildSettings;
                }
                if(buildConfig[block].name == 'Release'){
                    releaseBlock = buildConfig[block].buildSettings;
                }
            }

            done();
        });
    });

    console.log("Running iOS pbxproj spec");

    it('should respect the quote attribute', function() {
        expect(debugBlock['"QUOTE_DEFAULT"']).toEqual('"YES"');
        expect(debugBlock['"QUOTE_BOTH"']).toEqual('"YES"');
        expect(debugBlock['"QUOTE_KEY"']).toEqual('YES');
        expect(debugBlock['QUOTE_VALUE']).toEqual('"YES"');
        expect(debugBlock['QUOTE_NONE']).toEqual('YES');
    });

    it('should respect the buildType attribute', function() {
        expect(debugBlock['"BUiLD_TYPE_DEFAULT"']).toEqual('"YES"');
        expect(releaseBlock['"BUiLD_TYPE_DEFAULT"']).toEqual('"YES"');

        expect(debugBlock['"BUiLD_TYPE_DEBUG"']).toEqual('"YES"');
        expect(releaseBlock['"BUiLD_TYPE_DEBUG"']).toEqual(undefined);

        expect(debugBlock['"BUiLD_TYPE_RELEASE"']).toEqual(undefined);
        expect(releaseBlock['"BUiLD_TYPE_RELEASE"']).toEqual('"YES"');
    });


    it('should insert the CODE_SIGN_IDENTITY keys', function() {
        expect(debugBlock['"CODE_SIGN_IDENTITY"']).toEqual('"iPhone Developer: Dave Alden (8VUQ6DYDLL)"');
        expect(debugBlock['"CODE_SIGN_IDENTITY[sdk=iphoneos*]"']).toEqual('"iPhone Developer: Dave Alden (8VUQ6DYDLL)"');
        expect(debugBlock['"CODE_SIGN_IDENTITY[sdk=iphoneos9.1]"']).toEqual('"iPhone Developer: Dave Alden (8VUQ6DYDLL)"');

        expect(releaseBlock['"CODE_SIGN_IDENTITY"']).toEqual('"iPhone Distribution: Working Edge Ltd (556F3DRHUD)"');
        expect(releaseBlock['"CODE_SIGN_IDENTITY[sdk=iphoneos*]"']).toEqual('"iPhone Distribution: Working Edge Ltd (556F3DRHUD)"');
        expect(releaseBlock['"CODE_SIGN_IDENTITY[sdk=iphoneos9.1]"']).toEqual('"iPhone Distribution: Working Edge Ltd (556F3DRHUD)"');
    });

});