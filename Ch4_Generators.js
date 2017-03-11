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