/**
 * Created by brenn on 3/8/2017.
 */

/**
 * Created by brenn on 3/8/2017.
 */
var data = ajax("http://some.url.1");

console.log(data);
// Generally the line above will run before the ajax request returns a value
// Ajax calls are not synchronous
// This means it will not wait for a return value before continuing
// We make requests "NOW" and receive them "LATER"
