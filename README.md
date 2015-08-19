# AngularJS FireBase Image Upload

The objective of this project is do one thing good, upload images optimized to FireBase.
 
After deciding the size of the thumbnails, the images are optimized reducing the image size and quality. If the user try to upload one image of 10MB approximately, for one thumbnail of 200x200px the size resulting is: 1.6kB approx.

Relevant files: 
- [fileUpload.js](/app/scripts/fileUpload.js)
- [fileUpload.html](/app/views/fileUpload.html)
- [moreFilters.js](/app/scripts/moreFilters.js)

```javascript
/******* FireBase Data Base Structure  *******

 Publications Path:
 publications/fireBaseUniqueIdentifier/images/uuid/isDeleted
 publications/fireBaseUniqueIdentifier/images/uuid/name

 publications:{
              fireBaseUniqueIdentifier:{
                title:'publication title',
                description:'publication description',
                images:{
                  uuid:{
                    name:'file name',
                    isDeleted:false
                  },
                  uuid:{
                    name:'file name',
                    isDeleted:false
                  },
                  uuid:{
                    name:'file name',
                    isDeleted:true
                  }
                }
              }
            }

 Images Paths:
 images/uuid/thumbnails/w200xh200
 images/uuid/thumbnails/w600xh600

 images:{
              uuid:{
                thumbnails:{
                  w200xh200:{
                    reference: uuid,
                    base64: 'base64 string'
                  },
                  w600xh600:{
                    reference: uuid,
                    base64: 'base64 string'
                  }
                }
              }
            }

 **/
```

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.


