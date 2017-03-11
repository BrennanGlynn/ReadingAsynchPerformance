//////////////////////////////////////////////////////////////////
//                          Chapter 4                           //
//                         JS Generators                        //
//////////////////////////////////////////////////////////////////
/*                                                              */
//////////////////////////////////////////////////////////////////
//                  Breaking Run-to-Completion                  //
//////////////////////////////////////////////////////////////////
(function () {
    var x = 1;

    function *foo() {
        x++;
        yield; // pause!
        console.log( "x:", x );
    }

    function bar() {
        x++;
    }

    // construct an iterator 'it' to control the generator
    var it = foo();

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

    function *foo(x,y) {
        return x * y;
    }

    var it = foo( 6, 7 );

    var res = it.next();

    console.log(res);
})();

/*
The result of that next(..) call is an object with a value property with whatever value
is returned from *foo(..)
*/

//////////////////////////////////////////////////////////////////
//                      Iteration Messaging                     //
//////////////////////////////////////////////////////////////////