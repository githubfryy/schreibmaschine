CRDT (conflict-free replicated data type) is a data structure that can be replicated across multiple computers in a network, where replicas can be updated independently and in parallel, without the need for coordination between replicas, and with a guarantee that no conflicts will occur.
CRDT is often used in collaborative software, such as scenarios where multiple users need to work together to edit/read a shared document, database, or state. It can be used in database software, text editing software, chat software, etc.


## What problems does CRDT solve?


For example, a scenario where multiple users edit the same document online at the same time.
This scenario requires that each user sees the same content, even after concurrent edits by different users (e.g. two users changing the title at the same time), which is known as consistency. (To be precise, CRDT satisfies the eventual consistency, see below for more details)
Users can use CRDT even when they are offline. They can be back on sync with others the network is restored. It also supports collaboratively editing with other users via P2P. It is known as partitioning fault tolerance. This allows CRDT to support decentralizedapplications very well: synchronization can be done even without a centralized server.


## The Emergence of CRDTs


The formal concept of Conflict-free Replicated Data Types (CRDTs) was first introduced in Marc Shapiro's 2011 paper, [Conflict-Free Replicated Data Types (opens in a new tab)](https://inria.hal.science/hal-00932836/file/CRDTs_SSS-2011.pdf). However, it can be argued that the groundwork for CRDTs was laid earlier, in the 2006 study [Woot (opens in a new tab)](https://doi.org/10.1145%2F1180875.1180916): An Algorithm for Collaborative Real-time Editing. The primary motivation behind developing CRDTs was to address the challenges associated with designing conflict resolution mechanisms for eventual consistency. Prior to the introduction of CRDTs, literature on the subject offered limited guidance, and ad hoc solutions were often prone to errors. Consequently, Shapiro's paper presented a simple, theoretically sound approach to achieving eventual consistency through the use of CRDTs.
(PS: Marc Shapiro actually wrote a paper [Designing a commutative replicated data type (opens in a new tab)](https://hal.inria.fr/inria-00177693v2/document) in 2007. In 2011, he reworded commutative into conflict-free in 2011, expanding the definition of commutative to include state-based CRDT)
According to [CAP theorem (opens in a new tab)](https://en.wikipedia.org/wiki/CAP_theorem), it is impossible for a distributed computing system to perfectly satisfy the following three points at the same time.

-   *Consistency*: each read receives the result of the most recent write or reports an error; it behaves as if it is accessing the same piece of data
-   *Availability*: every request gets a non-error response - but there is no guarantee that the data fetched is up-to-date
-   *Partition tolerance*: the ability of a distributed system to continue functioning properly even when communication between its different components is lost or delayed, resulting in a partition or network failure.

If the system cannot achieve data consistency within the time limit, it means that partitioning has occurred and a choice must be made between C and A for the current operation, so "perfect consistency" is in conflict with "perfect availability".
CRDTs do not provide "perfect consistency", but Strong Eventual Consistency (SEC). This means that site A may not immediately reflect the state changes from site B, but when A and B synchronize their messages they both regain consistency and do not need to resolve potential conflicts (CRDT mathematically prevents conflicts from occurring). *Strong Eventual Consistency* does not conflict with *Availability* and *Partition Tolerance*. CRDTs provide a good CAP tradeoff.
![CPA](https://loro.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fa4858e2a50bc1a2d79722060156e89b0cac5815cf25e8c67e409aa0926280cef.6a607785.png&w=3840&q=75) *CRDT satisfies A + P + Eventual Consistency; a good tradeoff under CAP*
(PS: In 2012, Eric Brewer, author of the CAP theorem, wrote an article [CAP Twelve Years Later: How the "Rules" Have Changed (opens in a new tab)](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/), explaining that the description of the "two out of three CAP features" is actually misleading, and that the CAP actually prohibits perfect availability and consistency in a very small part of the design space, i.e., in the presence of partitions; in fact, the design of the tradeoff between C and A is very flexible. A good example is CRDT.)


## A simple CRDT case


We can use a few simple examples to get a general idea of how CRDTs achieve Strong Eventual Consistency.

> Grow-only CounterHow can we count the number of times something happens in a distributed system without locking?
![G-Counter](https://loro.dev/_next/image?url=%2Fcrdt-G-Counter.gif&w=828&q=75)

-   Let each copy increments only its own counter => no locking synchronization & no conflicts
-   Each copy keeps the count values of all other copies at the same time
-   Number of occurrences = sum of count values of all copies
-   Since each copy only updates its own count and does not conflict with other counters, this type satisfies consistency after message synchronization

> Grow-only Set![G-Set](https://loro.dev/_next/image?url=%2Fcrdt-G-Set.gif&w=828&q=75)

-   The elements in a Grow-only Set can only be increased and not decreased
-   To merge two such states, you only need to do a merge set
-   This type satisfies consistency after message synchronization because there are no conflicting operations since the elements only grow and do not decrease.

Both of these methods are CRDTs, and they both satisfy the following properties

-   They can both be updated independently and concurrently, without coordination (locking) between replicas
-   There is no possibility of conflict between multiple updates
-   Final consistency can always be guaranteed


## Introduction to the Principle


There are two types of CRDTs: Op-based CRDTs and State-based CRDTs. This article focuses on the concept of Op-based CRDTs.
Op-based CRDTs operate on the principle that if two users perform identical sequences of operations, the final state of the document should also be identical. To achieve this, each user saves all the operations performed on the data (Operations) and synchronizes these Operations with other users to ensure a consistent final state. A critical challenge in this approach is ensuring the order of Operations remains consistent, especially when parallel modification operations occur. To address this, Op-based CRDTs require that all possible parallel Operations be commutative, satisfying the final consistency requirement.


## Comparison of CRDT and OT


Both CRDT and [Operation Transformation(OT) (opens in a new tab)](https://en.wikipedia.org/wiki/Operational_transformation) can be used in online collaborative applications, with the following differences
[Tips and Tricks](https://loro.dev/docs/tutorial/tips "Tips and Tricks")[How to Choose the Right CRDT Types](https://loro.dev/docs/concepts/choose_crdt_type "How to Choose the Right CRDT Types")