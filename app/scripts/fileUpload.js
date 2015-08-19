'use strict';

angular.module('fileUpload',['cgBusy','uuid','jlareau.pnotify'])
  .controller('FileUploadController', ['$scope','$q','fileService',function ($scope,$q,fileService) {

    fileService.files().then(function(_files_) {
      $scope.files  = _files_;
    });

    $scope.filesLength  = function(){
      return fileService.filesLength();
    };

    $scope.queueFiles = function(){
      return fileService.queueFiles();
    };

    $scope.progressInstances = {};

    $scope.uploadFiles = function(){
      fileService.files().then(function(files) {
        angular.forEach(files,function(fileObject,reference){
          if(fileObject.inServer === false){
            $scope.progressInstances[reference] = $q.when(fileService.upload(fileObject,reference));
          }
        });
      });
    };

    fileService.filesInServer();

  }])
  .factory('fileService',['$q','rfc4122','FireRef','$firebaseObject',function($q,rfc4122,FireRef,$firebaseObject){

    var fixedFireBaseUniqueIdentifier = '-Juqip8bcmF7u3z97fbe';
    var publicationImagesReference = FireRef.child('publications').child(fixedFireBaseUniqueIdentifier).child('images');
    var publicationImages = $firebaseObject(publicationImagesReference);

    /**
     * The ALL files, in queue to upload and those already in server.
     * @type {object}
     * */
    var files     = {};

    /**
     * Copy of files object, used for return the file object to its original state, which it is an empty object '{}'.
     * @type {object}
     * */
    var filesCopy = angular.copy(files);

    /**
     * insert custom made file object in files object
     * @param {String} reference
     * @param {Object} fileObject
     **/
    var insertFile = function (reference,fileObject) {
      files[reference] = fileObject;
    };

    /**
     * Receives the reference (UUID), and the new data object.
     * @param {String} reference is UUID string
     * @param {Object} newData
     * @return undefined
     **/
    var updateFileObj = function(reference,newData){
      angular.forEach(newData, function (value, key) {
        files[reference][key] = value;
      });
    };

    /**
     * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
     * images to fit into a certain area.
     * Source:  http://stackoverflow.com/a/14731922
     *
     * @param {Number} srcWidth Source area width
     * @param {Number} srcHeight Source area height
     * @param {Number} maxWidth Nestable area maximum available width
     * @param {Number} maxHeight Nestable area maximum available height
     * @return {Object} { width, height }
     */
    var calculateAspectRatioFit = function (srcWidth, srcHeight, maxWidth, maxHeight) {
      var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
      return { width: srcWidth*ratio, height: srcHeight*ratio };
    };

    /**
     Reduce imagen size and quality.
     @param {String} imagen is a base64 string
     @param {Number} width
     @param {Number} height
     @param {Number} quality from 0.1 to 1.0
     @return Promise.<String>
     **/
    var generateThumbnail = function(imagen, width, height, quality){
      var deferred          = $q.defer();
      var canvasElement     = document.createElement('canvas');
      var imagenElement     = document.createElement('img');
      imagenElement.onload  = function(){
        var  dimensions = calculateAspectRatioFit(imagenElement.width,imagenElement.height,width,height);
        canvasElement.width   = dimensions.width;
        canvasElement.height  = dimensions.height;
        var context           = canvasElement.getContext('2d');
        context.drawImage(imagenElement, 0, 0, dimensions.width, dimensions.height);
        deferred.resolve(canvasElement.toDataURL('image/WebP', quality));
      };
      imagenElement.src = imagen;
      return deferred.promise;
    };

    return {
      /**
       * files, to upload and in server
       * @return Promise.<Object>
       * */
      files: function(){
        return $q.when(files);
      },
      /**
       * how many files there are
       * @return {Number}
       * */
      filesLength : function(){
        return Object.keys(files).length;
      },
      /**
       * how many files are in queue to upload
       * @return {Boolean}
       * */
      queueFiles : function(){
        var queue = false;
        angular.forEach(files,function(file){
          if(file.inServer === false){ queue = true; }
        });
        return queue;
      },
      /**
       Receives one FILE type object, which is added or "pushed" to the files object. Later, we can get that object with the reference that return the success
       promise. The reference is UUID (https://en.wikipedia.org/wiki/Universally_unique_identifier).
       @param {File} file
       @return Promise.<String>
       **/
      newFile : function(file){
        var uuid    = rfc4122.v4();
        // creating file object
        files[uuid]          = {
          file:     file,
          fileName: file.name,
          fileSize: file.size,
          preview:  'images/loading.jpeg',
          inServer: false
        };
        return $q.when(uuid);
      },
      /**
       Receives the reference (UUID) of the FILE object in files object. Create FileReader instance to read the file with that reference.
       @param  {String} reference is UUID string.
       @return  Promise.<String> . The Reading is a base64 string.
       **/
      readFile : function(reference){
        var deferred = $q.defer();
        var reader = new FileReader();
        reader.onerror = function(error){
          // The reading operation encounter an error.
          deferred.reject(error);
        };
        reader.onload = function (loadEvent) {
          // The reading operation is successfully completed.
          deferred.resolve(loadEvent.target.result);
        };
        reader.readAsDataURL(files[reference].file);
        return deferred.promise;
      },
      updateFileObj : updateFileObj,
      /**
       Remove ALL queue files to upload.
       @return Promise.<String>
       **/
      removeQueueFiles : function(){
        angular.forEach(files,function(fileObject,reference){
          if(fileObject.inServer === false){
            delete files[reference];
          }
        });
        return $q.when('All queue files has been removed successfully.');
      },
      /**
       Remove the file with the reference provided in queue to upload or one that it is in the server.
       @return Promise.<String>
       **/
      removeFile : function(reference){
        var deferred = $q.defer();
        var fileName = files[reference].fileName;
        var message = 'The file: '+ fileName +', has been removed successfully.';
        if(files[reference].inServer){
          var imageObject = $firebaseObject(publicationImagesReference.child(reference));
          imageObject.isDeleted = true;
          imageObject.$save().then(function(){
            delete files[reference];
            deferred.resolve(message);
          });
        }else{
          delete files[reference];
          deferred.resolve(message);
        }
        return deferred.promise;
      },
      setFireBaseUniqueIdentifier:function(uniqueIdentifier){

      },
      upload: function (fileObject,reference) {
        var deferred = $q.defer();

        $q.all({
          reference: $q.when(reference),
          fileName: $q.when(fileObject.fileName),
          w200xh200Thumbnail: generateThumbnail(fileObject.preview,200,200,1.0),
          w600xh600Thumbnail: generateThumbnail(fileObject.preview,600,600,1.0)
        }).then(function(the){

          var reference = the.reference;
          var fileName  = the.fileName;

          var imagesReference  = FireRef.child('images').child(reference);
          var imageObj   = $firebaseObject(imagesReference);

          imageObj.name       = fileName;
          imageObj.thumbnails = {};

          imageObj.thumbnails.w200xh200 = {};
          imageObj.thumbnails.w200xh200.reference  = reference;
          imageObj.thumbnails.w200xh200.base64     = the.w200xh200Thumbnail;

          imageObj.thumbnails.w600xh600 = {};
          imageObj.thumbnails.w600xh600.reference = reference;
          imageObj.thumbnails.w600xh600.base64     = the.w600xh600Thumbnail;

          publicationImages[reference]           = {};
          publicationImages[reference].name      = fileName;
          publicationImages[reference].isDeleted = false;

          $q.all({
            inImages: imageObj.$save().then(function(ref) {
              var reference = ref.key();
              updateFileObj(reference,{inServer:true});
            }),
            inPublications: publicationImages.$save()
          }).then(function(){
            deferred.resolve();
          });
        });

        return deferred.promise;
      },
      filesInServer: function(){
        publicationImages.$watch(function() {
          angular.forEach(publicationImages,function(fileObj,reference){
            if(!fileObj.isDeleted){
              if(!angular.isDefined(files[reference])){
                var file = {
                  fileName: fileObj.name,
                  preview:  'images/loading.jpeg',
                  inServer: true
                };
                insertFile(reference,file);
                var w200xh200ThumbnailReference = FireRef.child('images').child(reference).child('thumbnails').child('w200xh200');
                var imageObj  = $firebaseObject(w200xh200ThumbnailReference);
                imageObj.$loaded(function(thumbnailObject){
                  updateFileObj(thumbnailObject.reference,{preview:thumbnailObject.base64});
                });
              }
            }
          });
        });
      }
    };

  }])
/**
 * The fileUpload Directive Take the last files specified by the User.
 * */
  .directive('fileUpload',['$q','fileService','$log',function($q,fileService,$log){
    return {
      restrict: 'E',
      template: '<input type="file" multiple="multiple" accept="image/*" class="file-input">',
      replace:true,
      link: function (scope,element) {
        fileService.fileInputElement = element;
        element.on('change', function (event) {
          angular.forEach(event.target.files,function(file){
            fileService.newFile(file)
              .then(function(reference){
                // read file
                return $q.all({reference: $q.when(reference), reading: fileService.readFile(reference)});
              }).then(function(the){
                // update file object
                fileService.updateFileObj(the.reference,{preview: the.reading});
              },
              function(error){
                $log.error('Error: ',error);
              });
          });
        });
      }
    };
  }])
/**
 * The fileUploadTrigger Directive Triggers click event on file Input Element.
 * */
  .directive('fileUploadTrigger',['fileService',function(fileService){
    return {
      restrict: 'A',
      link: function (scope,element) {
        element.bind('click', function () {
          fileService.fileInputElement.click();
        });
      }
    };
  }])
/**
 * The removeFiles return files object to original state.
 * */
  .directive('removeQueueFiles',['fileService','notificationService',function(fileService,notificationService){
    return {
      restrict: 'A',
      scope:{
        successMessage:'@'
      },
      link: function (scope,element) {
        element.bind('click', function () {
          fileService.removeQueueFiles().then(function(message){
            scope.successMessage = scope.successMessage ? scope.successMessage : message;
            notificationService.success(scope.successMessage);
          });
        });
      }
    };
  }])
/**
 * The removeFile directive delete the specified file object in files object.
 * */
  .directive('removeFile',['fileService','notificationService',function(fileService,notificationService){
    return {
      restrict: 'A',
      scope:{
        successMessage:'@'
      },
      link: function (scope,element,attributes) {
        element.bind('click', function () {
          fileService.removeFile(attributes.removeFile).then(function(message){
            scope.successMessage = scope.successMessage ? scope.successMessage : message;
            notificationService.success(scope.successMessage);
          });
        });
      }
    };
  }]);
