//////////////////////////////////////////////////////////////////
//                           Chapter 2                          //
//                           Callbacks                          //
//////////////////////////////////////////////////////////////////
/*
Callbacks are by far the most common way that asynchrony in js is expressed
Sophisticated programs can be written with callbacks as only asynchronous method
But callbacks have shortcomings that promises can take care of however, it's hard
to use abstraction if you don't understand what it's abstracting, and why.
*/

//////////////////////////////////////////////////////////////////
//                       Sequential Brain                       //
//////////////////////////////////////////////////////////////////

/*
When humans say they are multitaskers they really mean they can switch back and forth rapidly
This is a lot like how asynch concurrency works in javascript
If you think about every word as a single async event, there are opportunities for my brain to
get distracted or interrupted by another event.
I don't get distracted every word, but it still happens that I will switch contexts and watch
youtube instead of reading the next section immediately
*/

//////////////////////////////////////////////////////////////////
//                     Doing Versus Planning                    //
//////////////////////////////////////////////////////////////////

/*
Even though our brains operate like an asynch patter we still plan out tasks in sequential order
I need to go to school, then take my econ test, then go to my finance class, and then go home.
The reason it's difficult to write async code is that stream of consciousness thinking/planning
is unnatural for most of us
We like to think step by step but callbacks are not step by step when asynchrony is introduced.
*/

// NOTE! The only thing worse than not knowing why some code breaks is not knowing why it even worked.

//////////////////////////////////////////////////////////////////
//                         Trust Issues                         //
//////////////////////////////////////////////////////////////////

/*
The mismatch between sequential brain planning and callback-driven async JS code is only part
of the problem with callbacks. There's something much deeper to be concerned about.

When we hand over a callback to another party we have a contract of things we expect to be
maintained for our code to be effective

We call this the inversion of control
*/

//////////////////////////////////////////////////////////////////
//                    Tale of Five Callbacks                    //
//////////////////////////////////////////////////////////////////

/*
 Here's roughly the list you come up with of ways the analytics utility could misbehave:
 Call the callback too early (before it's been tracked)
 Call the callback too late (or never)
 Call the callback too few or too many times (like the problem you encountered!)
 Fail to pass along any necessary environment/parameters to your callback
 Swallow any errors/exceptions that may happen

This is a lot to worry about for every single callback you pass to a utility that you can't trust
*/

//////////////////////////////////////////////////////////////////
//                     Not Just Others' Code                    //
//////////////////////////////////////////////////////////////////

// Can you trust your own utilities?

function addNumbers(x,y) {
    return x + y;
}

console.log(addNumbers(21,21));
// => 42

console.log(addNumbers("21","21"));
// => "2121"

// We could

function add(x, y) {
    x = Number(x);
    y = Number(y);
    return x + y;
}

console.log(add(3, 4)); // => 7
console.log(add("1", "3")); // => 4
console.log(add("1", 2)); // =>3

// Trust, but verify

/*
 If you have code that uses callbacks, especially but not exclusively with third-party utilities,
 and you're not already applying some sort of mitigation logic for all these inversion of control
 trust issues, your code has bugs in it right now even though they may not have bitten you yet.
 Latent bugs are still bugs.
*/

//////////////////////////////////////////////////////////////////
//                   Trying to Save Callbacks                   //
//////////////////////////////////////////////////////////////////

/*
A common callback pattern is called "error-first style" sometimes called "Node Style"
The first argument of a single callback is reserved for an error object
If error will pass a truthy value for first argument
 */

// function response(err, data) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(data);
//     }
// }
//
// ajax( "http://website.url.1", response );
// ajax( "http://website.url.2", response );

/*
Several problems:
    Nothing prevents repeated invocations (could use a once decorator though)
    You might get an error and success or even no error signal
    Doesn't have much reuse so will have to repeat for every callback

    What if the response never get's called? Now we have to add a timeout
 */

// Don't release Zalgo!
/*
Always invoke callbacks asynchronously
even if it's right away on the event loop

This way all callbacks are predictably async
*/

// Consider

// function result(data) {
//     console.log(a);
// }
//
// var a = 0;
//
// ajax("..pre-cached-url..", result);
// a++;
/*
This code could print 0, or 1 depending on conditions
To fix we need more bloated boilerplate to weigh the project down
This is the story with callbacks. They can do anything, but you have
to work hard to get it to work

*/

//////////////////////////////////////////////////////////////////
//                            Review                            //
//////////////////////////////////////////////////////////////////

/*
Callbacks are fundamental, but not enough for the future
Brains plan things sequentially in a single thread
Callbacks express asynchronous behavior nonlinearly which makes code
hard to reason. This can lead to bad bugs.

We need a way to express asynchrony in a synchronous manner
Callbacks suffer from inversion of control leading to trust issues
Inventing logic to solve these is possible, but difficult and clunky

We need a generalized solution. (promises and generators wink* wink*)
*/


