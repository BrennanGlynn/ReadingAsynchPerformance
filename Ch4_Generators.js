//////////////////////////////////////////////////////////////////
//                          Chapter 4                           //
//                         JS Generators                        //
//////////////////////////////////////////////////////////////////
/*                                                              */
//////////////////////////////////////////////////////////////////
//                  Breaking Run-to-Completion                  //
//////////////////////////////////////////////////////////////////
(function () {
    let x = 1,
        it;

    function *foo() {
        x++;
        yield; // pause!
        console.log( "x:", x );
    }

    function bar() {
        x++;
    }

    // construct an iterator 'it' to control the generator
    it = foo();

    // start 'foo()' here!
    it.next(); // x++
    console.log( x ); // => 2
    bar(); // x++
    console.log( x ); // => 3
    it.next(); // => x: 3
})();
/*

 1. The it = foo() operation does not execute the *foo() generator yet, but it
    merely constructs an iterator that will control its execution. More on iterators in a bit.
 2. The first it.next() starts the *foo() generator, and runs the x++ on the first line of *foo() .
 3. *foo() pauses at the yield statement, at which point that first it.next() call finishes.
    At the moment, *foo() is still running and active, but it's in a paused state.
 4. We inspect the value of x , and it's now 2 .
 5. We call bar() , which increments x again with x++ .
 6. We inspect the value of x again, and it's now 3 .
 7. The final it.next() call resumes the *foo() generator from where it was paused, and runs the
    console.log(..) statement, which uses the current value of x of 3 .

 */

//////////////////////////////////////////////////////////////////
//                       Input and Output                       //
//////////////////////////////////////////////////////////////////

(function () {
    let it, res;

    function *foo(x,y) {
        return x * y;
    }

    it = foo( 6, 7 );

    res = it.next();

    console.log(res); // { value: 42, done: true }
})();

/*
The result of that next(..) call is an object with a value property with whatever value
is returned from *foo(..)
*/

//////////////////////////////////////////////////////////////////
//                      Iteration Messaging                     //
//////////////////////////////////////////////////////////////////

(function () {
    let it, res;

    function *foo(x) {
        return x * (yield);
    }

    it = foo(5);

    // start generator
    it.next();

    res = it.next(5);

    console.log(res.value); // => 25
})();

// We can pass a value into a generator using it.next( value )
// This will assign that value to the most recently called yield
// Yield can pass out values as well!

(function () {
    function *foo(x) {
        return  x * (yield "Hello");
    }

    let it = foo( 9 );

    // starting generator
    res = it.next();
    console.log( res.value ); // => "Hello"

    // pass 7 to waiting yield
    res = it.next( 7 );
    console.log(res.value); // => 63
})();

// generators will finish with undefined value if no return

//////////////////////////////////////////////////////////////////
//                      Multiple Iterators                      //
//////////////////////////////////////////////////////////////////

/*

You can have multiple instances of the same generator running at the same time,
and they can even interact

*/

(function () {
    let z, it1, it2, val1, val2;

    function *foo() {
        let x, y;

        x = yield 2;
        z++;
        y = yield (x * z);
        console.log( x, y, z );
    }

    z = 1;

    it1 = foo();
    it2 = foo();

    it1.next(); // x: 2

    val2 = it2.next().value; // x: 2

    val1 = it1.next(val2 * 10 ).value; // x: (2 * 10) z: 2  => 40
    val2 = it2.next(val1 * 5 ).value; // x: (40 * 5), z: 3  => 600

    it1.next( val2 / 2 ); // x: 20, y: 300, z: 3
    it2.next( val1 / 4 ); // x: 200, y: 10, z: 3

})();

//////////////////////////////////////////////////////////////////
//                         Interleaving                         //
//////////////////////////////////////////////////////////////////

(function () {
    let a = 1,
        b = 2,
        s1, s2,
        n1, n2;

    function *foo() {
        a++;
        yield
        b = b * a;
        a = (yield b) + 3;
    }

    function *bar() {
        b--;
        yield
        a = (yield 8) + b;
        b = a * (yield 2);
    }
    /*
     Depending on what respective order the iterators controlling *foo() and *bar() are called,
     the preceding program could produce several different results.

     Let's make a helper called step(..) that controls an iterator:
    */
    function step(gen) {
        let it = gen(),
            last;

        return function () {
            // whatever is yield'ed out, just send it right back in the next time!
            last = it.next( last ).value;
        }
    }

    s1 = step( foo );
    s2 = step( bar );

    s1();
    s1();
    s1();

    s2();
    s2();
    s2();
    s2();

    console.log( a, b ); // => 11, 22

    a = 1;
    b = 2;

    n1 = step( foo );
    n2 = step( bar );

    n2();
    n2();
    n1();
    n2();
    n1();
    n1();
    n2();

    console.log( a, b); // => 12 18

})();

//////////////////////////////////////////////////////////////////
//                     Generator'ing Values                     //
//////////////////////////////////////////////////////////////////
/*                                                              */
//////////////////////////////////////////////////////////////////
//                    Producers and Iterators                   //
//////////////////////////////////////////////////////////////////
(function () {
    let gimmeSomething = (function () {
        let nextVal;

        return function () {
            if (nextVal !== void 0) {
                nextVal = (3 * nextVal) + 6;
            } else {
                nextVal = 1;
            }
            return nextVal;
        }
    })();

    console.log( gimmeSomething() );    // 1
    console.log( gimmeSomething() );    // 9
    console.log( gimmeSomething() );    // 33
    console.log( gimmeSomething() );    // 105
})();

//////////////////////////////////////////////////////////////////
//                      Generator Iterator                      //
//////////////////////////////////////////////////////////////////

// When you execute a generator you get an iterator back

(function () {
    function *something() {
        let nextVal;

        while (true) {
            if (nextVal === void 0) {
                nextVal = 1;
            } else {
                nextVal = (3 * nextVal) + 6;
            }

            yield nextVal;
        }
    }

    for (let v of something()) {
        console.log(v);
        if (v > 500) {
            break;
        }
    }

    // notice that it is (let v of something()) not (let v of something)
    // we called something(..) to get it's iterator to loop over
})();

//////////////////////////////////////////////////////////////////
//                    Stopping the Generator                    //
//////////////////////////////////////////////////////////////////

/*
In the previous example it seems as if the *something() was left in a suspended
state forever after the break in the loop was called

 If you specify a try..finally clause inside the generator, it will always be run even when
 the generator is externally completed. This is useful if you need to clean up resources
 (database connections, etc.):

*/

(function () {
    function *something() {
        try {
            let nextVal;

            while (true) {
                if (nextVal === undefined) {
                    nextVal = 1;
                } else {
                    nextVal = (nextVal * 3) + 6;
                }

                yield nextVal
            }
        }
        // cleanup clause
        finally {
            console.log( "cleaning up!" );
        }
    }

    let it = something();
    for (let v of it) {
        console.log( v );

        // don't let the loop run forever!
        if (v > 500) {
            console.log(
                it.return( "This is the last return value" ).value
            );
            // no 'break' needed here
        }
    }
})();

// When we call it.return(..) it terminates the generator
// It also sets the return value to whatever you passed in turn

//////////////////////////////////////////////////////////////////
//              Iterating Generators Asynchronously             //
//////////////////////////////////////////////////////////////////

// I thought we were talking about asynch coding patterns in this book?
// revisiting from chapter 3 a callback approach

/*
(function () {
    function foo(x,y,cb) {
        ajax(
            "http://some.url.1/?x=" + x + "&y=" + y,
            cb
        );
    }

    foo( 11, 31, function (err,text) {
        if (err) {
            console.error( err );
        } else {
            console.log( text );
        }
    })
})();
*/

// If we wanted to do the same task flow control with a generator

// (function () {
//     function foo(x,y) {
//         ajax(
//             "http://some.url.1/" + x + "&y=" + y,
//             function (err,data) {
//                 if (err) {
//                     // throw an error into *main
//                     it.throw( err )
//                 } else {
//                     it.next( data );
//                 }
//             }
//         )
//     }
//
//     function *main() {
//         try {
//             // foo(..) will run if ajax(..) is successful it will set the data to text
//             let text = yield foo( 11, 31 );
//             console.log( text );
//         }
//         catch (err) {
//             console.log( err );
//         }
//     }
//
//     let it = main();
//
//     // start it up
//     it.next();
// })();

//////////////////////////////////////////////////////////////////
//                  Synchronous Error Handling                  //
//////////////////////////////////////////////////////////////////

// Let's turn our attention to the try..catch inside the generator
// try {
//     let text = yield foo( 11, 31 );
//     console.log( text );
// }
// catch (err) {
//     console.log( err );
// }

/*
The yield -pause nature of generators means that not only do we get
synchronous-looking return values from async function calls, but we can
also synchronously catch errors from those async function calls!
*/

//////////////////////////////////////////////////////////////////
//                     Generators + Promises                    //
//////////////////////////////////////////////////////////////////

// I feel like we spent a lot of time on promises to still be using callbacks

/*The natural way to get the most out of Promises and generators is to yield
a Promise, and wire that Promise to control the generator's iterator*/

// Put the Promise-aware foo(..) together with the generator *main()

// (function () {
//     function foo(x,y) {
//         // will return a promise
//         return request(
//             "http://some.url.1/?x=" + x + "&y=" + y
//         );
//     }
//
//     function *main() {
//         try {
//             let text = yield foo(11, 31);
//             console.log( text );
//         }
//         catch (err) {
//             console.error( err );
//         }
//     }
//
//     let it = main();
//
//     let p = it.next().value;
//
//     // wait for the 'p' promise to resolve
//
//     p.then(
//         function (text) {
//             it.next( text );
//         },
//         function (err) {
//             it.throw( err )
//         }
//     );
// })();

// *main() did not have to change at all!

//////////////////////////////////////////////////////////////////
//                Promise-Aware Generator Runner                //
//////////////////////////////////////////////////////////////////

// Let's make a utility designed to run Promise-yielding generators
// Several Promise abstractation libraries provide just such a utility
// Including the author's asynquence library in Appendix A

function run(gen) {
    let args = [].slice.call(arguments, 1), it;

    // initialize the generator in the current context
    it = gen.apply(this, args);

    // return a promise for the generator completing
    return Promise.resolve().then(
        function handleNext(value) {
            let next = it.next(value);
            return (function handleResult(next) {
                // generator has completed?
                if (next.done) {
                    return next.value;
                } else {
                    return Promise.resolve(next.value).then(
                        // resume the async loop on success, sending the resolved
                        // value back into the generator
                        handleNext,

                        // if value is a rejected promise, propagate error back into the
                        // generator for its own error handling
                        function handleErr(err) {
                            return Promise.resolve(
                                it.throw(err)
                            ).then(
                                handleResult
                            )
                        }
                    )
                }
            })
        }
    );
}

// a utility/library helper is definitely the way to go

// How would you use run(..) with *main() in our running Ajax example?

// function *main() {
//     // ..
// }
//
// run( main );
/*
The way we wired run(..) , it will automatically advance the generator you pass to it,
asynchronously until completion.
*/


//////////////////////////////////////////////////////////////////
//               Promise Concurrency in Generators              //
//////////////////////////////////////////////////////////////////

// function *foo() {
//     let r1 = yield request( "http://some.url.1" );
//     let r2 = yield request( "http://some.url.2" );
//
//     let r3 = yield request(
//         "http://some.url.3/?v=" + r1 + "," + r2
//     );
//
//     console.log( r3 );
// }

// use previously defined 'run(..) utility
// run( foo );

// r1 and r2 could be run concurrently, but in this code they run sequentially

// The simplest approach:
// function *foo() {
//     // make both requests in parallel
//     let p1 = request( "http://some.url.1" );
//     let p2 = request( "http://some.url.2" );
//
//     // wait until both promises resolve
//     let r1 = yield p1;
//     let r2 = yield p2;
//
//     let r3 = yield request(
//         "http://some.url.3/?v=" + r1 + "," + r2
//     );
//
//     console.log( r3 )
// }

// run( foo );

// This is basically the same as Promise.all([..]);

// function *foo() {
//     let results = yield Promise.all([
//         request( "http://some.url.1" ),
//         request( "http://some.url.2" )
//     ]);
//
//     let [r1,r2] = results;
//
//     let r3 = yield request(
//         "http://some.url.3/?v=" + r1 + "," + r2
//     );
//
//     console.log( r3 );
// }
//
// run( foo );

//////////////////////////////////////////////////////////////////
//                       Promises, Hidden                       //
//////////////////////////////////////////////////////////////////

/*
As a word of stylistic caution, be careful about how much Promise logic you include
inside your generators. The whole point of using generators for asynchrony in the way
we've described is to create simple, sequential, sync-looking code, and to hide as much
of the details of asynchrony away from that code as possible.
*/

// // note: normal function, not generator
// function bar(url1,url2) {
//     return Promise.all([
//         request( url1 ),
//         request( url2 )
//     ]);
// }
//
// function *foo() {
//     // hide the Promise-based concurrency details inside bar(..)
//     let results = yield bar(
//         "http://some.url.1",
//         "http://some.url.2"
//     );
//
//     let [r1,r2] = results;
//     let r3 = yield request(
//         "http://some.url.3/?v=" + r1 + "," + r2
//     );
//
//     console.log( r3 );
// }
//
// run( foo );

//////////////////////////////////////////////////////////////////
//                     Generator Delegation                     //
//////////////////////////////////////////////////////////////////

// yield-delegation is a way to integrate one generator into another
// The special syntax for yield-delegation is yield * __

(function () {
    function *foo() {
        console.log("'*foo()' starting");
        yield 3;
        yield 4;
        console.log("'*foo()' finished");
    }

    function *bar() {
        yield 1;
        yield 2;
        yield *foo(); // 'yield'-delegation
        yield 5;
    }

    let it = bar();

    console.log(it.next().value); // 1
    console.log(it.next().value); // 2
    console.log(it.next().value); // "'*foo()' starting"
                                  // 3
    console.log(it.next().value); // 4
    console.log(it.next().value); // "'*foo()' finished"
                                  // 5

})();

// As soon as the it iterator control exhausts the entire *foo()
// iterator, it automatically returns to controlling *bar()

// function *foo() {
//     let r2 = yield request("http://some.url.2");
//     let r3 = yield request("http://some.url.3/?v=" + r2);
//     return r3;
// }
// function *bar() {
//     let r1 = yield request("http://some.url.1");
// // "delegating" to `*foo()` via `yield*`
//     let r3 = yield *foo();
//     console.log(r3);
// }
// run(bar);

// Note: yield * yields iteration control

//////////////////////////////////////////////////////////////////
//                      Delegating Messages                     //
//////////////////////////////////////////////////////////////////

(function () {
    function *foo() {
        console.log("inside `*foo()`:", yield "B");

        console.log("inside `*foo()`:", yield "C");

        return "D";
    }

    function *bar() {
        console.log("inside `*bar()`:", yield "A");

        // `yield`-delegation!
        console.log("inside `*bar()`:", yield *foo());

        console.log("inside `*bar()`:", yield "E");

        return "F";
    }

    let it = bar();
    console.log("outside:", it.next().value);
    // outside: A

    console.log("outside:", it.next(1).value);
    // inside `*bar()`: 1
    // outside: B

    console.log("outside:", it.next(2).value);
    // inside `*foo()`: 2
    // outside: C

    console.log("outside:", it.next(3).value);
    // inside `*foo()`: 3
    // inside `*bar()`: D
    // outside: E

    console.log("outside:", it.next(4).value);
    // inside `*bar()`: 4
    // outside: F
})();

//////////////////////////////////////////////////////////////////
//                  Exceptions Delegated, Too!                  //
//////////////////////////////////////////////////////////////////