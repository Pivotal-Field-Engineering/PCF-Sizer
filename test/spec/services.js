'use strict';

(function() {
    describe('ShekelServicesController', function() {
        var $rootScope, createController, $httpBackend;
        var services = ['mysql', 'gemfire', 'rabbit', 'redis'];
        var mysqlVersions = ['1.6.5', '1.7.1', '1.6.4', '1.7', '1.3'];

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', '/services').respond(services);
            $httpBackend.when('GET', '/services/mysql/versions').respond(mysqlVersions);
            $httpBackend.when('GET', '/services/gemfire/versions').respond(mysqlVersions);
            $httpBackend.when('GET', '/services/rabbit/versions').respond(mysqlVersions);
            $httpBackend.when('GET', '/services/redis/versions').respond(mysqlVersions);

            $rootScope = $injector.get('$rootScope');
            var $controller = $injector.get('$controller');
            createController = function() {
                return $controller('ShekelServiceSizingController', {'$scope': $rootScope });
            }
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe('listing services', function() {

            beforeEach(function() {
                $httpBackend.expectGET('/services');
                createController();
                $httpBackend.flush();
            });

            it('should return a mysql and gemfire service', function() {
                var returnedServices = $rootScope.services();
                expect(returnedServices).toContain('mysql');
                expect(returnedServices).toContain('gemfire');
            });

            it ('should return as many services as the api returns', function() {
                expect($rootScope.services().length).toBe(services.length)
            });

            it('should initialize the version cache for all the services it finds so ng-repeat works', function() {
                expect(Array.isArray($rootScope.versioncache['mysql'].elements)).toBeTruthy();
                expect(Array.isArray($rootScope.versioncache['gemfire'].elements)).toBeTruthy();

            })
        });

        describe('listing versions', function() {
            var versions = null;

            beforeEach(function() {
                $httpBackend.expectGET('/services/mysql/versions');
                createController();
                $rootScope.getServiceVersions('mysql').then(function(v) {
                    versions = v;
                });
                $httpBackend.flush();
            });

            it('Should return all the mysql versions', function() {
                expect(versions.elements.length).toBe(mysqlVersions.length);
            });

            //It selects the highest element in the versonings.
            it('should contain version 1.7 and select it by default', function() {
                expect(versions.elements).toContain('1.7');
                expect(versions.selected).toBe('1.7.1')
            })
        });
    })
})();