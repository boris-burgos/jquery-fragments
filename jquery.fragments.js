/*
 * jQuery Fragments Plugin v0.1
 * http://www.codeko.com/
 *
 * Copyright (c) 2011 Codeko Informatica
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Date: 2011-04-24
 */
(function ($) {
    var matchingMethodsCache=null;
    var methods = {
        //Split a load the html into the diferents targets
        loadHtml:function(html,s){
            var self=this;
            if(s.useFullDocument){
                self=$("*");
            }
            //Create a dummy div to get the subelements
            var dummyDiv=$("<div>").append(html);
            dummyDiv.children().each(function(i,val){
                var el=$(val);
                if(el.hasClass(s.scriptTagClass)){
                    $.getScript(el.html());
                    return true;
                }
                //target is the elements that match with the block being proccessed
                var originalClasses=el.attr('class');
                var target=self.fragments("findTarget",self,val,s);
                el.attr('class',originalClasses);
                if(target){
                    //Take the default action
                    var action=s.defaultAction;
                    //Look for action class in the block
                    if(el.hasClass(s.replaceClass)){
                        action="replace";
                    }else if(el.hasClass(s.appendClass)){
                        action="append";
                    }else if(el.hasClass(s.prependClass)){
                        action="prepend";
                    }else if(el.hasClass(s.deleteClass)){
                        action="delete";
                    }
                    var content=el.html();
                    //Apply the action to the target
                    if(action=="replace"){
                        target.html(content);
                    }else if(action=="delete"){
                        target.remove();
                    }else if(action=="append"){
                        target.append(content);
                    }else if(action=="prepend"){
                        target.prepend(content);
                    }
                }
                return true;
            });	
        },
        getMatchingMethods:function(s){
            if(matchingMethodsCache==null){
                //matchinMethod defaults
                var defaults={
                    weight:50,
                    enabled:true,
                    useTag:true,
                    stopSearch:true,
                    action:function(){
                        return null;
                    }
                };
                matchingMethodsCache=[];
                //take all matchingMethods who are enabled
                $.each(s.matchingMethods,function(i,v){
                    var matchMethod=$.extend({},defaults,v);
                    if(matchMethod.enabled){
                        matchingMethodsCache.push(matchMethod);
                    }
                });
                //sort by weight
                matchingMethodsCache.sort(function (a, b) {
                    return  a.weight-b.weight;
                });
            }
            return matchingMethodsCache;
        },
        //Look for targets that matchs the block
        findTarget:function(container,content,s){
            var final_target=null;
            //Iterate all the matchingMethods and add the selections to a single jquery object
            $.each(this.fragments("getMatchingMethods",s),function(i,method){
                if(method.enabled){
                    var target=method.action(container,content,s);
                    if(target!=null && target.length>0){
                        if(final_target!=null){
                            final_target=final_target.add(target);
                        }else{
                            final_target=target;
                        }
                        //If the method sais stop we stop!
                        if(method.stopSearch){
                            return false;
                        }
                    }
                }
                return true;
            });
            return final_target;
        },
        //Returns if the fragments are enabled or disabled
        enabled:function(jqXHR,s){
            if(s.enabled=='httpHeaders'){
                var header=jqXHR.getResponseHeader("X-jQuery-Fragments-Enabled");
                return header && (header=="true" || header=="1");
            }
            return s.enabled;
        },
        //Remove action classes from an element
        removeActionClasses:function(element,s){
            element=$(element);
            element.removeClass(s.appendClass);
            element.removeClass(s.prependClass);
            element.removeClass(s.replaceClass);
            element.removeClass(s.deleteClass);
        },
        //Return the tagName of a element (using the specialTagClass settings)
        getTagName:function (element,s){
            var tagName=element.tagName;
            element=$(element);
            $.each(s.specialTagClass,function(name,val){
                if(element.hasClass(name)){
                    tagName=val;
                    return false;
                }
                return true;
            });
            return tagName;
        }
    };
    //Main method
    $.fn.fragments=function(method){
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        }else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.fragments' );
            return false;
        }    
    };
    
    //We create a no selector load function that works with the html tag
    $.extend({
        //A load version to use without any selector
        load:function(){
            $.fn.load.apply($("*"),arguments);
        },
        //Default settings
        fragmentsSettings: {
            'enabled'         : 'httpHeaders',//httpHeaders,true,false
            'defaultAction':'replace',//replace,delete,append,prepend
            'appendClass' : 'fragments-append',
            'prependClass' : 'fragments-prepend',
            'replaceClass' : 'fragments-replace',
            'deleteClass' : 'fragments-delete',
            'specialTagClass':{
                'fragments-tag-head':'head'
            },
            'scriptTagClass':'fragments-tag-script',
            'useFullDocument':false,
            'matchingMethods':{
                "byId":{
                    weight:10,
                    action:function(container,content,s){
                        var tag=$(this).fragments("getTagName",content,s);
                        var selector=(this.useTag?tag:"")+"#"+$(content).attr('id');
                        return container.find(selector);
                    }
                },
                "byAllClasses":{
                    weight:20,
                    action:function(container,content,s){
                        $(this).fragments("removeActionClasses",content);
                        var glue=".";
                        if(this.useTag){
                            var tag=$(this).fragments("getTagName",content,s);
                            glue=tag+".";
                        }
                        var classList=glue+$(content).attr('class').split(/\s+/).join(".");
                        return container.find(classList);
                    }
                },
                "byClass":{
                    weight:30,
                    action:function(container,content,s){
                        $(this).fragments("removeActionClasses",content);
                        var glue=".";
                        if(this.useTag){
                            var tag=$(this).fragments("getTagName",content,s);
                            glue=tag+".";
                        }
                        var classList =glue+$(content).attr('class').split(/\s+/).join(","+glue);
                        return container.find(classList);
                    }
                },
                "byTag":{
                    weight:100,
                    enabled:false,
                    action:function(container,content,s){
                        var tag=$(this).fragments("getTagName",content,s);
                        return container.find(tag+":not([class][id])");
                    }
                },
                "byAllTags":{
                    weight:100,
                    enabled:false,
                    action:function(container,content,s){
                        var tag=$(this).fragments("getTagName",content,s);
                        return container.find(tag);
                    }
                },
                "bySingleTag":{
                    weight:100,
                    action:function(container,content,s){
                        var tag=$(this).fragments("getTagName",content,s);
                        var match= container.find(tag+":not([class][id])");
                        if(match.length==1){
                            return match;
                        }
                        return false;
                    }
                }
            }
        },
        //Reset the matchingMethodsCache and apply the new settings
        fragmentsSetup: function ( settings ) {
            matchingMethodsCache=null;
            return $.extend(true,$.fragmentsSettings, settings );
        }
    });
    
    //Overrides the jQuery load function to make the magic
    $.fn.load = function( url, params, callback,options) {
        if ( typeof url !== "string" && _load ) {
            return _load.apply( this, arguments );
        // Don't do a request if no elements are being requested
        } else if ( !this.length ) {
            return this;
        }
        var off = url.indexOf( " " );
        if ( off >= 0 ) {
            var selector = url.slice( off, url.length );
            url = url.slice( 0, off );
        }
        // Default to a GET request
        var type = "GET";
        // If the second parameter was provided
        if ( params ) {
            // If it's a function
            if ( $.isFunction( params ) ) {
                // We assume that it's the callback
                options=callback;
                callback = params;
                params = undefined;
            // Otherwise, build a param string
            } else if ( typeof params === "object" ) {
                params = $.param( params, $.ajaxSettings.traditional );
                type = "POST";
            }
        }
        if ( typeof callback === "object" ){
            options=callback;
            callback = undefined;
        }
        //Make sure the options exists
        options=options||{}
        options=$.extend(true,{},$.fragmentsSettings, options );
        var self = this;
        // Request the remote document
        $.ajax({
            url: url,
            type: type,
            dataType: "html",
            data: params,
            // Complete callback (responseText is used internally)
            complete: function( jqXHR, status, responseText ) {
                // Store the response as specified by the jqXHR object
                responseText = jqXHR.responseText;
                // If successful, inject the HTML into all the matched elements
                if ( jqXHR.isResolved() ) {
                    // #4825: Get the actual response in case
                    // a dataFilter is present in ajaxSettings
                    jqXHR.done(function( r ) {
                        responseText = r;
                    });
                    //Is fragments enabled?
                    var enabled=self.fragments("enabled",jqXHR,options);
                    if(selector){
                        var html=$("<div>").append(responseText.replace(rscript, "")).find(selector);
                        if(enabled){
                            self.fragments("loadHtml",html,options);	
                        }else{
                            self.html(html);
                        }
                    }else{
                        if(enabled){
                            self.fragments("loadHtml",responseText,options);
                        }else{
                            self.html(responseText);
                        }
                    }
                }
                if ( callback ) {
                    self.each( callback, [ responseText, status, jqXHR ] );
                }
            }
        });
        return this;
    };
})(jQuery);
