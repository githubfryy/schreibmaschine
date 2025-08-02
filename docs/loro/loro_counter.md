Docs
Tutorial
Counter

Loro's Counter will add up all the applied values, and supports integers and floating point numbers.
Here is how to use it:

```
const doc = new LoroDoc();
const counter = doc.getCounter("counter");
counter.increment(1);
counter.increment(2);
counter.decrement(1);
expect(counter.value).toBe(2);
```

[Tree](https://loro.dev/docs/tutorial/tree "Tree")[Version](https://loro.dev/docs/tutorial/version "Version")