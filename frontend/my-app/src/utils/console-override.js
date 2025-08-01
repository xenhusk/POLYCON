// console-override.js
// This file overrides console methods in production

if (process.env.NODE_ENV === 'production') {
  // Override console methods to do nothing in production
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.trace = () => {};
  
  // You can choose to keep console.error for critical errors
  // console.error = console.error; // Uncomment this line to keep error logs
}

export default {};
