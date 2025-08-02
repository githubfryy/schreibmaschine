In this benchmark, we use the Automerge paper dataset.
Source: [https://github.com/automerge/automerge-perf/tree/master/edit-by-index (opens in a new tab)](https://github.com/automerge/automerge-perf/tree/master/edit-by-index)
The dataset consists of:

-   182,315 single-character insertion operations
-   77,463 single-character deletion operations
-   A total of 259,778 operations
-   104,852 characters in the final document

The first line of settings in the table below indicates configurations without `gc` and `compress`.

> The `x` in the table above signifies that the corresponding setting is not supported.

Loro also supports a shallow snapshot encoding format with gc capabilities by truncating the history. For details, see [the doc](https://loro.dev/docs/tutorial/encoding). If truncated from the latest version, the result will be:
[Native Benchmarks](https://loro.dev/docs/performance/native "Native Benchmarks")[Examples](https://loro.dev/docs/examples "Examples")