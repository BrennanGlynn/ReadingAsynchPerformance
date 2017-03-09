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

// we're on page 34 gonna eat lunch


