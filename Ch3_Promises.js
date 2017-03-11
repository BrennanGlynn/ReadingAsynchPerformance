//////////////////////////////////////////////////////////////////
//                          Chapter 3                           //
//                           Promises                           //
//////////////////////////////////////////////////////////////////

/*
What if instead of handing the continuation of our program to another
party, we could expect it to return us a capability to know when its task finishes,
and then our code could decide what to do next?

Well that's exactly what promises are.

 Note: The word "immediately" will be used frequently in this chapter, generally to refer to some Promise resolution action.
 However, in essentially all cases, "immediately" means in terms of the Job queue behavior (see Chapter 1), not in the
 strictly synchronous now sense.
*/

//////////////////////////////////////////////////////////////////
//                         Future Value                         //
//////////////////////////////////////////////////////////////////

/*
Imagine a fast food purchase
    You make an order and pay for it requesting a cheeseburger back
    The cheeseburger might not be ready so the cashier gives a receipt with an order number
    This order number ensures that I will get a cheeseburger back when it is ready (a promise)
    While waiting you can do other things.
    You are able to reason about your future cheeseburger already, even though you don't have it in your hands yet.
    You use the order number as a placeholder for the cheeseburger and exchange it for the cheeseburger when its ready
    I know I will either get a cheeseburger or news of a cheeseburger shortage
 */

//////////////////////////////////////////////////////////////////
//                         Promise Value                        //
//////////////////////////////////////////////////////////////////

// function add(xPromise, yPromise) {
//     // 'Promise.all([ .. ])' takes an array of promises,
//     // and returns a new promise that waits on them all to finish
//     return Promise.all( [xPromise, yPromise] )
//
//         // when promise is resolved add x and y together
//         .then(function (values) {
//             // 'values' is an array of the messages from previously resolved promises
//             return values[0] + values [1];
//         });
// }

// // 'fetchX()' and 'fetchY()' return promises to return their values
// add( fetchX(), fetchY() )
//     // we get a promise back for the sum
//     // then(..) we wait for the resolution of that promise as 'sum'
//     .then(
//         function (sum) {
//             console.log(sum)
//         },
//         function (err) {
//             console.log(err)
//         }
//     );

// With Promises, the 'then(..) call can actually take two functions, fulfillment and rejection
// If something went wrong the second callback error handler is passed back to 'then(..)'

// When a promise is resolved it becomes an immutable value
// Promises are an easily repeatable mechanism for encapsulating and composing future values.

//////////////////////////////////////////////////////////////////
//                       Promise "Events"                       //
//////////////////////////////////////////////////////////////////

// function foo(x) {
//     // start doing something that could take a while
//
//     // construct and return new promise
//     return new Promise( function (resolve, reject) {
//         // eventually call 'resolve(..)' or 'reject(..)'
//         // which are the resolution callbacks for the promise
//     } );
// }
//
// function bar(fooPromise) {
//     // listen for foo(..) to complete
//     fooPromise.then(
//         function () {
//             // foo is done
//             // do bar(..)'s thing
//         },
//         function () {
//             // something went wrong in foo
//         }
//     )
// }
//
// var p = foo(42);
// bar(p);

// Another way to approach this

// function bar() {
//     // foo(..) is finished
//     // do bar(..)'s thing
// }
//
// function oopsBar() {
//     // something went wrong in foo(..) so bar(..) didn't run
// }
//
// var p = foo( 42 );
//
// p.then(bar, oopsBar);

// In the first approach bar(..) gets called no matter what and must handle fooPromise itself
// In the second approach bar(..) only gets called if success else oopsBar(..) will be called

//////////////////////////////////////////////////////////////////
//                         Promise Trust                        //
//////////////////////////////////////////////////////////////////

/*
 Let's start by reviewing the trust issues with callbacks-only coding.
    Call the callback too early
    Call the callback too late (or never)
    Call the callback too few or too many times
    Fail to pass along any necessary environment/parameters
    Swallow any errors/exceptions that may happen
*/

//// Calling Too Late

// p.then( function () {
//     p.then( function () {
//         console.log( 'C' );
//     });
//     console.log( 'A' );
// });
// p.then( function () {
//     console.log( 'B' );
// });
//
// // A B C

// Here 'C' cannot interrupt and precede 'B'

// Promise Scheduling Quirks

    // good practice is not to code in such a way where the ordering of multiple callbacks matters

//// Never calling the callback

// What if the Promise itself never gets resolved

// // a utility for timing out a Promise
// function timeoutPromise(delay) {
//     return new Promise( function (resolve, reject) {
//         setTimeout( function () {
//             reject( "Timeout!" );
//         }, delay);
//     });
// }

// // setup a timeout for 'foo()'
// Promise.race( [foo(), timeoutPromise( 3000 )]).then(
//     function () {
//         // foo was fulfilled on time
//     },
//     function (err) {
//         // foo was either rejected or took too long
//     }
// );

// We have ensured we will get a signal back from foo()

//// Failing to Pass Any Parameters

// If you want to pass along multiple values, you must wrap
// them in another single value that you pass, such as an array or object

//// Swallowing Errors

/*
 If at any point in the creation of a Promise, or in the observation of its resolution,
 a JS exception error occurs, such as a TypeError or ReferenceError , that exception will
 be caught, and it will force the Promise in question to become rejected.

 If an error happens during the observation the .then(..) call itself will be rejected
*/

//////////////////////////////////////////////////////////////////
//                      Trustable Promise?                      //
//////////////////////////////////////////////////////////////////

/*
 If you pass an immediate, non-Promise, non-thenable value to Promise.resolve(..) , you get a promise that's fulfilled with
 that value. In other words, these two promises p1 and p2 will behave basically identically:
 */

var p1 = new Promise( function (resolve, reject) {
    resolve(42);
});

var p2 = Promise.resolve( 42 );

// But if you pass a genuine Promise to Promise.resolve(..), you get the same promise back

var p3 = Promise.resolve( 21 );

var p4 = Promise.resolve( p3 );

p3 == p4; // true

// Even more importantly it will attempt to unwrap until a final non-Promise-like value is extracted

var p = {
    then: function (cb) {
        cb( 42 );
    }
};

// this works OK, but only by good fortune

p.then(
    function fulfilled(val) {
        console.log(val); // 42
    },
    function rejected(err) {
        // never gets here
    }
);

// Promise.resolve(..) will accept any thenable, and unwrap it to its non-thenable value

/*
So let's say we're calling a foo(..) utility and we're not sure we can trust its return value to
be a well-behaving Promise, but we know it's at least a thenable.
Promise.resolve(..) will give us a trustable Promise wrapper to chain off of:
*/

// // don't just do this:
// foo(42).then(function (v) {
//     console.log(v);
// });
//
// // instead, do this:
// Promise.resolve(foo(42)).then(function (v) {
//     console.log(v);
// });

//////////////////////////////////////////////////////////////////
//                          Chain Flow                          //
//////////////////////////////////////////////////////////////////

// Every time you call then(..) on a Promise, it creates and returns a new Promise, which we can chain with.

// var p = Promise.resolve( 21 );
// var p2 = p.then( function (v) {
//     console.log(v); // 21
//
//     // fulfill 'p2' with value 42
//     return v * 2
// });
//
// p2.then(function (v) {
//     console.log(v); // 42
// });

// Returning v * 2 is success

// Thankfully we can chain these together
// var p = Promise.resolve( 2 );
// p
//     .then(function (v) {
//         console.log(v);
//
//         return v * 2;
//     } )
//     .then(function (v) {
//         console.log(v);
//     } );

// What if we want step 2 to wait for step 1 to do something asynchronous?
// var p = Promise.resolve( 18 );
// p.then( function (v) {
//     console.log( v );   // 18
//
//     // create a promise and return it
//     return new Promise( function (resolve,reject) {
//         // introduce asynchrony
//         setTimeout( function () {
//             resolve( v * 2 );
//         }, 200);
//     } );
// } )
// .then( function (v) {
//     console.log( v );   // 36
// });

// It works just fine!

// Now we can construct a sequence of asynch steps that can delay the next step if it needs
// If no value is returned it passes an undefined value and can be used to signal the next step
// Let's generalize a delay-Promise creation into a utility we can reuse

// function delay(time) {
//     return new Promise( function (resolve,reject) {
//         setTimeout( resolve, time );
//     } );
// }
//
// delay(100) // step 1
// .then( function STEP2() {
//     console.log( "step 2 (after 100ms)");
//     return delay(200)
// })
// .then( function STEP3() {
//     console.log( "step 3 (after another 200ms)");
//     return delay(300)
// } )
// .then( function STEP4() {
//     console.log( "step 4 (after another 300" );
// });

// Instead of timers, lets use ajax requests

// Promise-aware ajax
// function request(url) {
//     return new Promise( function (resolve,reject) {
//         // the ajax(...) callback should be our promise's resolve function
//         ajax( url, resolve );
//     });
// }
//
// request( "http://some.url.1/" )
//  .then( function (response1) {
//      return request( "httpL//some.url.2/?v=" + response1 );
//  } )
//  .then( function (response2) {
//      console.log( response2 );
//  } );

// What if something went wrong in one of the steps of the Promise chain?

// // step 1:
// request( "http://some.url.1/")
//
// // step 2:
//  .then( function (response1) {
//      foo.bar(); // undefined, error!
//
//      // never gets here
//      request( "http://some.url.2/?v=" + response1 );
//  } )
//  .then(
//      function fulfilled(response2) {
//          // never gets her
//      },
//      function rejected(err) {
//          console.log( err );
//          return 42
//      }
//  )
//  .then(function (msg) {
//      console.log(msg);
//  } );

// when an error in step 2 happens the handler in step 3 catches it
// if no rejection handler it will simply rethrow the error until it reaches an explicit rejection handler

/*

 A then(..) call against one Promise automatically produces a new Promise to return from the call.

 Inside the fulfillment/rejection handlers, if you return a value or an exception is thrown,
 the new returned (chainable) Promise is resolved accordingly.

 If the fulfillment or rejection handler returns a Promise, it is unwrapped, so that whatever its
 resolution is will become the resolution of the chained Promise returned from the current then(..).

 In the next chapter, we'll see a significantly nicer pattern for sequential flow control expressivity, with
 generators.

*/

//////////////////////////////////////////////////////////////////
//           Terminology: Resolve, Fulfill, and Reject          //
//////////////////////////////////////////////////////////////////

// var p = new Promise( function (X,Y) {
//     // X() for fulfillment
//     // Y() for rejection
// } );

// X() is usually used to mark the Promise as fulfilled
// Usually?

// Y() always marks the Promise as rejected.

// Why shouldn't we call it fulfill(..) instead of resolve(..) to be more accurate?
// var rejectedTh = {
//     then: function (resolved,rejected) {
//         rejected( "Oops" );
//     }
// };
//
// var rejectedPr = Promise.resolve( rejectedTh);

// The first callback parameter of the Promise(..) constructor will either:
//      unwrap a thenable (identically to Promise.resolve(..))
//      unwrap a genuine Promise

// var rejectedPr = new Promise( function (resolve,reject) {
//     // resolve this promise with a rejected promise
//     resolve( Promise.reject( "Oops" ) );
// } );
//
// rejectedPr.then(
//     function fulfilled() {
//         // never gets here
//     },
//     function rejected(err) {
//         console.log(err);
//     }
// );

//////////////////////////////////////////////////////////////////
//                        Error Handling                        //
//////////////////////////////////////////////////////////////////

var p = Promise.resolve( 42 );
p.then(
    function fulfilled(msg) {
        // will throw error numbers don't have string functions
        console.log( msg.toLowerCase() );
    },
    function rejected(err) {
        // never gets here
    }
).then(
    function fulfilled(msg) {
        console.log( "success" );
    },
    function rejected(err) {
        console.log( err ); // TypeError: msg.toLowerCase is not a function
    }
);

//////////////////////////////////////////////////////////////////
//                        Pit of Despair                        //
//////////////////////////////////////////////////////////////////
