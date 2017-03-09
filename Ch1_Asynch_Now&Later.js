//////////////////////////////////////////////////////////////////
//                           Chapter 1                          //
//                    Asynchrony: Now & Later                   //
//////////////////////////////////////////////////////////////////

// var data = ajax("http://some.url.1");
//
// console.log(data);


// Generally the line above will run before the ajax request returns a value
// Ajax calls are not synchronous
// This means it will not wait for a return value before continuing
// We make requests "NOW" and receive them "LATER"

// The simplest way of waiting from now until later is to use a callback

// ajax("http://some.url.1", function (data) {
//     console.log(data);
// });

// When the ajax call is completed the callback function will run with data from request

/*
Any time you wrap code in a function and expect it to execute in response to some event
you are introducing asynchrony into your code

The JS engine doesn't run in isolation. It runs inside a hosting environment,
Over the last several years JS has expanded. Node.js for example.

*/

//////////////////////////////////////////////////////////////////
//                          Interaction                         //
//////////////////////////////////////////////////////////////////

// To address a race condition you can coordinate interaction

// var res = [];
//
// function response(data) {
//     if (data.url == "http://website.url.1") {
//         res[0] = data;
//     } else if (data.url == "http://website.url.2") {
//         res[1] = data;
//     }
// }
//
// ajax( "http://website.url.1", response );
// ajax( "http://website.url.2", response );

// res[0] will always hold website 1's response even if website 2's response is calledback first

// Some concurrency scenarios are always broken without coordinated interaction

// var a, b;
//
// function foo(x) {
//     a = x * 2;
//     baz();
// }
//
// function bar(y) {
//     b = y * 2;
//     baz();
// }
//
// function baz() {
//     console.log( a + b );
// }
//
// ajax( "http://website.url.1", foo );
// ajax( "http://website.url.2", bar );

/*
This code will always fail because foo or bar will run first leaving a or b undefined
when baz is called

We can solve this with a gate like so
*/

(function () {
    var a, b;

    function foo(x) {
        a = x * 2;
        baz();
    }

    function bar(y) {
        b = y * 2;
        baz();
    }

    function baz() {
        if (a && b) {
            console.log(a + b);
        }
    }

    bar(2);
    console.log("bar has completed");
    // => "bar has completed"
    foo(4);
    // => 12
    console.log("foo has completed");
    // => "foo has completed"
})();

// Baz does not run until both foo and bar have run

//////////////////////////////////////////////////////////////////
//                          Cooperation                         //
//////////////////////////////////////////////////////////////////

(function () {
    var res = [];

    function response(data) {
        res = res.concat(
            data.map( function (val) {
                return val * 2;
            })
        );
    }

    // ajax( "http://website.url.1", response );
    // ajax( "http://website.url.2", response );

})();

// Whichever ajax request returns first will have entire contents mapped
// This could be time intensive with enough records
// We need to build a better system that doesn't hog the event loop queue

(function () {
    var res = [];

    function response(data) {
        // do 1000 at a time
        var chunk = data.splice(0, 1000);

        res = res.concat(
            chunk.map(function (val) {
                return val * 2;
            })
        );

        // anything left?
        if (data.length > 0) {
            // async schedule next batch
            setTimeout( function () {
                response( data );
            }, 0 );
        }
    }

    // ajax( "http://website.url.1", response );
    // ajax( "http://website.url.2", response );
})();

// This set up allows other tasks to interweave with each ajax request while mapping
// We use "setTimeout(...0)" to send function to end of current event queue

//////////////////////////////////////////////////////////////////
//                             Jobs                             //
//////////////////////////////////////////////////////////////////

/*

 As of ES6, in addition to an event loop queue, we have the "Job queue"
 The "Job queue" is a queue hanging off the end of every tick in the event loop queue

 To use a metaphor: the event loop queue is like an amusement park ride, where once you finish the ride, you have to go
 to the back of the line to ride again. But the Job queue is like finishing the ride, but then cutting in line and
 getting right back on.

 Jobs are kind of like the spirit of the setTimeout(..0) hack, but implemented in such a way as to have a much more well
 defined and guaranteed ordering: later, but as soon as possible.

 */

//////////////////////////////////////////////////////////////////
//                            Review                            //
//////////////////////////////////////////////////////////////////

// A JS program is usually made of chunks: now and later.
// Even though the program is executed chunk by chunk, they all access the program scope and state


// The event loop runs until the queue is empty. Each iteration of the event loop is a tick
// User interaction, IO, and timers put events on the queue

// JS only processes one event at a time

// Concurrency is when two or more chains of events interleave over time.

// It's often necessary to coordinate interaction between concurrent processes



