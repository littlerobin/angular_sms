angular.module('callburnApp').factory('SnippetCrudDataService',
    [            '$q',
        function ($q) {
        return {
            makeInterval: makeInterval,
            getHoursAndMinutes: getHoursAndMinutes,

        };


        function makeInterval(start, end, step) {

            step = typeof step !== 'undefined' ?  step : 1;

            start = parseInt(start);
            end   = parseInt(end);

            if(start > end) {
               var item = start;
                start = end;
                end = item;
            }

           var interval = [];


            for(var i = start; i <= end; i += step) {


                interval.push(i<10?"0"+i:""+i+"");
            }

            return interval;

        }


        function getHoursAndMinutes (currentDay) {

           var queue = $q.defer();
           var hours = [];

            currentDay.forEach(function(item) {

               var startHour = item.start.split(':')[0];
               var endHour   = item.end.split(':')[0];

               var startMin = item.start.split(':')[1];
               var endMin   = item.end.split(':')[1];

               var interval = [];
                interval = interval.concat(makeInterval(startHour,endHour));

                if (interval.length > 1) {
                    for(var i = 0; i < interval.length; i++ ) {
                       var minObject = {};

                        if(i === 0) {
                            minObject[interval[i]] = {
                                from : parseInt(startMin),
                                to   : 59
                            };
                        } else if(i === interval.length - 1) {
                            minObject[interval[i]] = {
                                from : 0,
                                to   : parseInt(endMin)
                            };
                        } else {
                            minObject[interval[i]] = {
                                from : 0,
                                to   : 59
                            };
                        }
                        interval[i] = minObject;
                    }
                } else {

                   var minObject = {};

                    minObject[interval[0]] = {

                        from : parseInt(startMin),
                        to   : parseInt(endMin)
                    };
                    interval[0] = minObject;
                }

                hours = hours.concat(interval);

            });

            queue.resolve(hours);

            return queue.promise;

        }




    }]);