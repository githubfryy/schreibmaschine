Loro supports two types of lists: `List` and `MovableList`. The `List` is a standard list that supports Insert and Delete operations. In contrast, the `MovableList` supports additional Set and Move operations.
Using a combination of insert and delete operations, one can simulate set and move operations on a `List`. However, this approach fails in concurrent editing scenarios. For example, if the same element is set or moved concurrently, the simulation would result in the deletion of the original element and the insertion of two new elements, which does not meet expectations.
The `MovableList` addresses these issues by ensuring that set and move operations do not lead to such problems, though it incurs additional overheads. Specifically, when performing only insertions/deletions, the `MovableList` is approximately 80% slower in encode/decode and consumes about 50% more memory compared to the `List`.
Both `List` and `MovableList` utilize the [*Fugue* (opens in a new tab)](https://arxiv.org/abs/2305.00583) to achieve *maximal non-interleaving*. Additionally, `MovableList` uses the algorithm from [*Moving Elements in List CRDTs* (opens in a new tab)](https://martin.kleppmann.com/2020/04/27/papoc-list-move.html) to implement the move operation.


## Basic Usage



### List



### MovableList



## Using Cursor on List


The Cursor on a List changes with the list's modifications. If new elements are inserted in front of it, it moves to the right. If elements in front are deleted, it moves to the left. If elements are inserted or deleted behind it, it remains stationary.
If you use a List to represent paragraphs in an article, you can use a Cursor to stably represent the selection range on the paragraph.
[Composing CRDTs](https://loro.dev/docs/tutorial/composition "Composing CRDTs")[Map](https://loro.dev/docs/tutorial/map "Map")