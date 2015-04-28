var obj = [{
  match: /abc/i,
  replacement: 'a'
}];

obj = obj.concat({
  match: /abc/i,
  replacement: 'b'
});

console.log(obj);