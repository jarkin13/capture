var s,
  PhotoCollections = {
    settings: {
      id: function(parent) {
        return parent.data('photoid');
      },
      photo: function(current) {
        return current.closest('.col-photo');
      },
      addPhoto: $('.dropdown'),
      addNew: $('#add-new'),
      addNewModal: $('#add-new-modal'),
      collections: $('#collections')
    },

    data: {
      counter: 0,
      add: function(name, photoid) {
        var collection = {
          id: c.counter,
          name: name,
          total: 0,
          photos: []
        };
        if( photoid ) {
          collection.photos[0] = {
            photoid: photoid
          };
          collection.total = collection.total + 1;
        }
        this.collections.push(collection);
        this.counter = this.counter + 1;
        return collection.id;
      },
      get: function(id) {
        var collection;
        $.each(c.collections, function(key, value){
          if( value.id === id ) {
            collection = value;
          }
        });
        return collection;
      },
      update: function(id, photoid) {
        var collection = this.get(id);
            photoid = parseInt(photoid);
        var update = true, 
            msg;
        $.each(collection.photos, function(key, value){
          if( value.photoid === photoid ) {
            update = false;
            msg = 'This photo is already added to this collection';
          }
        });
        if( update ) {
          var total = collection.photos.length;
          collection.photos[total]= {
            photoid: photoid
          };
          collection.total = collection.total + 1;
          return '1';
        } else {
          return msg;
        }
      },
      remove: function(id) {
        id = parseInt(id);
        this.collections = $.grep(this.collections, function(a){
          return a.id !== id;
        });
        
        var response = '0';
        $.each(c.collections, function(key, value){
          if(value.id === id) {
            response = 'This collection was not successfully removed. Please try again';
          }
        });
        return response;
      },
      removePhoto: function(id, photoid) {
        id = parseInt(id);
        var response = '0',
            collection = this.get(id);
        photoid = parseInt(photoid);  
        collection.total = collection.total - 1;
        collection.photos = $.grep(collection.photos, function(a){
          return a.photoid !== photoid;
        });
        $.each( collection.photos, function(key, value){
          if(value.photoid === photoid) {
            response = 'This photo was not successfully removed from this collection. Please try again';
          }
        });

        return response;
      },
      collections: []
    },

    init: function() {
      s = this.settings;
      c = this.data;
      this.dropdownCollections();
      this.addNewInstant();
      this.addNewCollection();
      this.showCollection();
      this.removeItems();
    },

    updateCollection: function(id, update) {
      var collection = c.get(id);
      if( update === 'add' ){
          var show = '<li class="show-collection link" data-id="' + id + '"><i class="fa fa-image icon"></i> ' + collection.name + ' <i class="fa fa-trash-o remove"></i></li>';
          var add = '<li class="add-collection" data-id="' + id + '"><span>+</span> ' + collection.name + '</li>';
          $('.photo-collections').append(show);
          //all collections
          $(add).insertBefore(s.collections.find('.divider'));
          //s.collections.find('.divider').after(add);
          msg = 'added ' + collection.name;
      }

      if( update === 'remove' ){
        //go back to all photos
        $('.container').addClass('all');
        $('.col-photo').siblings().removeClass('show');
        //remove from lists
        $('.show-collection[data-id=' + id + ']').remove();
        $('.add-collection[data-id=' + id + ']').remove();
        toastr.success('You successfully removed this photo collection!');
      }

      if( update === 'remove-photo'){
        $('.col-photo[data-photoid=' + id + ']').removeClass('show');
      }
    },

    dropdownCollections: function() {
      //show collections dropdown
      s.addPhoto.on('show.bs.dropdown', function(event){
        $('#new-collection').focus();
        s.collections.find('#new-collection').val('');
        $('#add-instant').addClass('hidden');  
        s.collections.find('.add-new-input').css('padding-right', '0');
        //remove old photo id
        s.collections.find('#add-photoid').val('');
        var photo = s.photo($(event.delegateTarget));
        var position = $(photo).position(),
            left = position.left + 15,
            top = position.top + (photo.find('img').height() + 40);
        $('.dropdown-container').addClass('open');
        $('.dropdown-menu').css({
          'top': top + 'px',
          'left': left + 'px'
        });
        //add new photo id
        s.collections.find('#add-photoid').val(s.id(photo));
      });
      
      s.addPhoto.on('hide.bs.dropdown', function(event){
        $('.dropdown-container').removeClass('open');
      });

      //add photo to collection 
      $(document).on('click', '.add-collection', function(){
        var id = $(this).data('id'),
            photoid = $('#collections').find('#add-photoid').val();
        if( c.update(id, photoid) === '1' ) {
          toastr.success('You successfully added this photo to the collection');         
        } else {
          toastr.error(c.update(id, photoid));         
        }
      });
    },

    addNewCollection: function() {
      var o = this;
      //add collection via modal
      $(document).on('click', '#create', function(){
        var newCollection = s.addNewModal.find('#new-collection').val(),
            photo = $('#collections').find('#add-photoid'),
            photoid = false;
        if( newCollection && photo ) {
          photoid = photo.val();
        } 
        if( newCollection ) {
          s.addNewModal.modal('hide');
          o.updateCollection(c.add(newCollection, photoid), 'add');  
        } else {
          var error = 'Please enter a name for the photo collection';  
          s.addNewModal.find('.error-msg')
            .removeClass('hidden')            
            .append(error);
        }
      });
      
      //show add instant button
      $('#collections').keyup(function(event){
        if( $(this).find('input').val() !== '' ) {
          s.collections.find('.add-new-input').css('padding-right', '25px');
          $(this).find('#add-instant').removeClass('hidden');  
        } else {
          s.collections.find('.add-new-input').css('padding-right', '0');
          $(this).find('#add-instant').addClass('hidden');  
        }
      });
      
      //add collection via modal on keyboard enter
      s.addNewModal.keypress(function(e) {
        if(e.which == 13) {
          var newCollection = s.addNewModal.find('#new-collection').val(),
              photo = $('#collections').find('#add-photoid'),
              photoid = false;
          if( newCollection && photo ) {
            photoid = photo.val();
          } 
          if( newCollection ) {
            s.addNewModal.modal('hide');
            o.updateCollection(c.add(newCollection, photoid), 'add');  
          } else {
            var error = 'Please enter a name for the photo collection';  
            s.addNewModal.find('.error-msg')
              .removeClass('hidden')            
              .append(error);
          }
          return false; 
        }
      });

      s.addNewModal.on('show.bs.modal', function(event) {
        var modal = $(this),
            button = $(event.relatedTarget); // Button that triggered the modal
        var getVal = $('#collections').find('#new-collection').val();
        if( getVal !== '' ) {
          modal.find('input').val(getVal);
        } else {
          modal.find('input').val('');
        }
        if( s.photo(button).length !== 0 ) {
          var id = s.id(s.photo(button));
          modal.data('photoid', id);
        } else {
          modal.removeData('photoid');
        }
      });
    },

    addNewInstant: function() {
      var o = this;
      
      //keep open when clicking input
      s.collections.on('click', 'input', function(){
        return false;
      });
      
      //show add instant button
      s.addPhoto.keyup(function(event){
        if( $(this).find('input').val() !== '' ) {
          $(this).find('#add-instant').removeClass('hidden');  
        } else {
          $(this).find('#add-instant').addClass('hidden');  
        }
      });
      
      //clear input
      s.addPhoto.on('hide.bs.dropdown', function(){
        $('#add-instant').addClass('hidden'); 
        $(this).find('input').val('');
      });
      
      //show add instant button
      s.collections.keyup(function(event){
        if( $(this).find('input').val() !== '' ) {
          $(this).find('#add-instant').removeClass('hidden');  
        } else {
          $(this).find('#add-instant').addClass('hidden');  
        }
      });
      
      //add collection on the fly - hitting enter
      s.collections.keypress(function(e) {
        if(e.which == 13) {
          var newCollection = s.collections.find('input').val(),
              photoid = s.id(s.photo($('.dropdown.open')));
          o.updateCollection(c.add(newCollection, photoid), 'add');  
          $('#collections').find('input').val('');
          $('.dropdown.open').removeClass('open');
          $('.dropdown-container').removeClass('open');
        }
      });

      $(document).on('click', '#add-instant', function(){
        var newCollection = s.collections.find('input').val(),
            photoid = s.id(s.photo($('.dropdown.open')));
        o.updateCollection(c.add(newCollection, photoid), 'add');
        s.collections.find('input').val('');
        $('.dropdown.open').removeClass('open');
        $('.dropdown-container').removeClass('open');
      });
    },

    showCollection: function() {
      $(document).on('click', '.show-all', function(){
        $('.container').addClass('all');
        $('.show-collection.active').removeClass('active');
        $('.col-photo').siblings().removeClass('show');
      });
      
      $(document).on('click', '.show-collection', function(){
        var id = $(this).data('id'),
            collection = c.get(id);
        $('.container').removeClass('all');
        $('.link').siblings().removeClass('active');
        $('.col-photo').siblings().removeClass('show');
        $(this).addClass('active');
        $('.photo-collection h2').text(collection.name);
        $('.photo-collection button').attr('data-collectionid', collection.id);
        $('.total').find('.num').text(collection.total);
        $.each(collection.photos, function(key, value){
          $('.col-photo[data-photoid=' + value.photoid + ']').addClass('show');
        });
      });
    },

    removeItems: function() {
      var o = this;
      //remove the active collection
      $(document).on('click', '#remove-confirm', function(){
        var id = $('#remove-collection').attr('data-collectionid');
        if( c.remove(id) === '0' ) {
          o.updateCollection(id, 'remove');
        } else {
          toastr.error(c.remove(id));
        }
        $('#remove-collection-alert').modal('hide');   
      });

      //remove the active collection
      $('#remove-photo-alert').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var id = s.id(s.photo(button));
        $(this).find('#photoid').val(id);
      });

      $(document).on('click', '#remove-photo-confirm', function(){
        var id = $('#remove-collection').attr('data-collectionid'),
            photoid = $('#remove-photo-alert').find('#photoid').val();
        if( c.removePhoto(id, photoid) === '0' ) {
          var collection = c.get(parseInt(id));
          $('.total').find('.num').text(collection.total);
          o.updateCollection(photoid, 'remove-photo');
        } else {
          toastr.error(c.removePhoto(id, photoid));
        }
        $('#remove-photo-alert').modal('hide');
      });
    }
  };

$(document).ready(function() {
  PhotoCollections.init();
});
