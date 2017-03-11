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
