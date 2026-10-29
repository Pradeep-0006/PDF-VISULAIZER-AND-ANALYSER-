import { StudyMaterial, SampleDocument } from '../types';

export const sampleDistributedSystems: StudyMaterial = {
  id: 'sample-cs-raft',
  meta: {
    title: 'Raft Consensus & Distributed Replicated State Machines',
    subject: 'Computer Science & Distributed Systems',
    targetExamLevel: 'Undergraduate / University Engineering Exams',
    estimatedStudyTime: '45 mins',
    keyThemes: ['Leader Election', 'Log Replication', 'Safety Invariants', 'Term Numbers', 'Split Brain Avoidance'],
    sourceFileName: 'Raft_Consensus_Academic_Chapter.pdf',
    generatedAt: new Date().toISOString(),
  },
  studySummary: {
    executiveOverview:
      'Raft is an understandable consensus algorithm designed for replicated state machines. It decomposes consensus into three independent sub-problems: Leader Election, Log Replication, and Safety. Nodes operate in one of three states: Follower, Candidate, or Leader. Time is divided into arbitrary terms identified by sequential integers, ensuring split-vote recovery and strong consistency across un-synchronized networks.',
    keyTakeaways: [
      'Decomposition: Raft breaks consensus into Leader Election, Log Replication, and Safety Invariant enforcement.',
      'Majority Quorum: Any election or log commitment requires agreement from a strict majority (N/2 + 1) of cluster nodes.',
      'Strong Leader: Logs only flow un-directionally from the Leader to Followers; followers never send log entries to the leader.',
      'Log Matching Property: If two logs contain an entry with the same index and term, they are guaranteed to be identical up to that index.',
      'Election Safety: Exactly at most one leader can be elected per term.',
    ],
    corePrinciples: [
      {
        title: 'State Transition Dynamics',
        description: 'Followers transition to Candidates after randomized election timeouts (150ms-300ms) expire without receiving heartbeats.',
        importance: 'Tested in 80% of university distributed systems exams.',
      },
      {
        title: 'Commit Rule & Quorum Consistency',
        description: 'An entry is committed once replicated across a majority of nodes by the leader in the current term.',
        importance: 'Primary focus for 10-mark architectural questions.',
      },
      {
        title: 'Leader Completeness Invariant',
        description: 'If a log entry is committed in a given term, it will be present in the logs of all leaders for all higher terms.',
        importance: 'Key theoretical proof requirement.',
      },
    ],
    prerequisites: ['State Machine Replication concept', 'Network RPCs & Latency', 'Byzantine vs Fail-Stop fault models'],
  },
  diagrams: [
    {
      id: 'diag-raft-states',
      title: 'Node State Transitions & Election Cycle Flowchart',
      type: 'flowchart',
      description: 'Step-by-step state machine mapping how cluster nodes transition between Follower, Candidate, and Leader based on timeouts and majority votes.',
      mermaidCode: `flowchart TD
    classDef startNode fill:#0284c7,stroke:#0369a1,stroke-width:2px,color:#ffffff;
    classDef leaderNode fill:#059669,stroke:#047857,stroke-width:2px,color:#ffffff;
    classDef alertNode fill:#d97706,stroke:#b45309,stroke-width:2px,color:#ffffff;
    classDef normNode fill:#f8fafc,stroke:#94a3b8,stroke-width:1.5px,color:#0f172a;

    F[Follower Node\\nTerm T]:::startNode -->|Heartbeat Timeout 150-300ms| C[Candidate Node\\nTerm T+1]:::alertNode
    C -->|Increments Term, Votes for Self| RV[Broadcast RequestVote RPC]:::normNode
    RV -->|Receives Majority Votes >= N/2+1| L[Leader Node\\nEstablished for Term T+1]:::leaderNode
    RV -->|Split Vote: Timeout Expires| C
    RV -->|Discovers Higher Term T' > T| F
    L -->|Periodic AppendEntries Heartbeats| F
    L -->|Discovers Newer Leader with Higher Term| F`,
      keyNodesExplaining: [
        {
          node: 'Follower -> Candidate',
          explanation: 'Triggered when randomized election timer expires without receiving an AppendEntries heartbeat from the current leader.',
          examSignificance: 'Randomized timeout (150-300ms) prevents split-vote deadlocks.',
        },
        {
          node: 'Majority Quorum',
          explanation: 'Candidate requires at least floor(N/2)+1 positive votes to win the term.',
          examSignificance: 'Ensures at most one leader can be chosen per term.',
        },
        {
          node: 'Higher Term Discovery',
          explanation: 'Any node that observes a term T_new > T_current immediately reverts to Follower and updates its term.',
          examSignificance: 'Core invariant preventing stale leaders from accepting writes.',
        },
      ],
    },
    {
      id: 'diag-raft-log-replication',
      title: 'Log Replication & 2-Phase Commit Sequence',
      type: 'sequence',
      description: 'End-to-end communication sequence between Client, Cluster Leader, and Followers during write operations.',
      mermaidCode: `sequenceDiagram
    autonumber
    actor Client
    participant Leader
    participant FollowerA as Follower 1
    participant FollowerB as Follower 2

    Client->>Leader: Write Command (x = 5)
    Note over Leader: Append to local log (uncommitted)
    Leader->>FollowerA: AppendEntries RPC (index=10, term=3, val=5)
    Leader->>FollowerB: AppendEntries RPC (index=10, term=3, val=5)
    FollowerA-->>Leader: Success ACK
    FollowerB-->>Leader: Success ACK
    Note over Leader: Majority Quorum Reached (2/3 ACKs)
    Note over Leader: Commit Entry & Apply to State Machine
    Leader-->>Client: Success Result (x = 5)
    Leader->>FollowerA: Heartbeat with commitIndex = 10
    FollowerA->>FollowerA: Apply index 10 to State Machine`,
      keyNodesExplaining: [
        {
          node: 'AppendEntries RPC',
          explanation: 'Carries new log entries as well as the previous entry index and term for log consistency check.',
          examSignificance: 'Fails if the follower does not have matching previous log entry.',
        },
        {
          node: 'Majority Quorum Commit',
          explanation: 'Entry is strictly committed only after replication to a majority of servers.',
          examSignificance: 'Guarantees durability even if the leader crashes immediately after.',
        },
      ],
    },
    {
      id: 'diag-raft-mindmap',
      title: 'Raft Consensus Architectural Mindmap',
      type: 'mindmap',
      description: 'Hierarchical conceptual breakdown showing subproblems, RPC types, and safety invariants tested in examinations.',
      mermaidCode: `mindmap
  root((Raft Consensus))
    Sub-Problems
      Leader Election
        Randomized Timeouts
        RequestVote RPC
        Majority Quorum
      Log Replication
        AppendEntries RPC
        Consistent Indexing
        Log Matching Property
      Safety Invariants
        Election Safety
        Leader Append-Only
        Leader Completeness
    Fault Tolerance
      Split Brain Prevention
      Network Partition Recovery
      Crash-Recovery Model
    RPC Mechanisms
      RequestVote
      AppendEntries
      InstallSnapshot`,
      keyNodesExplaining: [
        {
          node: 'Safety Invariants',
          explanation: 'Guarantees the system never executes conflicting commands on different machines.',
          examSignificance: 'Frequently asked as a 5-mark proof question.',
        },
      ],
    },
  ],
  examConcepts: [
    {
      id: 'c-1',
      concept: 'Randomized Election Timeouts & Split Vote Prevention',
      weightage: 'crucial',
      weightagePercentage: 35,
      whyHighWeightage: 'Appears in nearly all distributed systems exams to test student understanding of timing dynamics and liveness.',
      coreDefinition:
        'Election timeouts are randomized between 150ms and 300ms so that one node times out before others, votes for itself, and claims leadership before competitors wake up, preventing continuous split votes.',
      keyFormulasOrRules: [
        'Broadcast Time << Election Timeout << MTBF (Mean Time Between Failures)',
        'Majority Quorum = floor(N / 2) + 1 nodes',
        'Heartbeat Interval = Typically 50ms (roughly 1/3 of minimum election timeout)',
      ],
      examTraps: [
        'Mistake: Believing split votes cause permanent system lockup. (Correction: Raft recovers automatically in the next randomized term timeout).',
        'Mistake: Forgetting that a candidate votes for itself before requesting external votes.',
      ],
      mnemonic: 'R-T-C-M (Reset timer, Term increment, Candidate switch, Majority seek)',
    },
    {
      id: 'c-2',
      concept: 'Log Matching Property & Invariants',
      weightage: 'crucial',
      weightagePercentage: 30,
      whyHighWeightage: 'Crucial for proving correctness in state machine replication and exam proof questions.',
      coreDefinition:
        'If two entries in different logs have the same index and term, they store the same command AND their logs are identical in all preceding entries up to that index.',
      keyFormulasOrRules: [
        'Consistency Check: AppendEntries includes (prevLogIndex, prevLogTerm). Follower rejects if match fails.',
        'Overwriting rule: Followers overwrite conflicting uncommitted entries with entries from the current leader.',
      ],
      examTraps: [
        'Assuming followers can overwrite committed entries (committed entries are permanent and immutable).',
      ],
      mnemonic: 'S-T-S-C (Same Term, Same Command, Same Past History)',
    },
    {
      id: 'c-3',
      concept: 'Network Partition & Split Brain Recovery',
      weightage: 'high',
      weightagePercentage: 20,
      whyHighWeightage: 'Standard scenario question: examiners give a 5-node cluster partitioned 2 vs 3 nodes.',
      coreDefinition:
        'In a network partition, only the partition containing a strict majority (>= 3 of 5) can elect a leader and commit log entries. The minority partition cannot reach quorum; when reconnected, minority nodes discard uncommitted logs.',
      keyFormulasOrRules: [
        'Minority cluster (N=2 in 5-node): Cannot commit writes.',
        'Majority cluster (N=3 in 5-node): Continues committing writes normally.',
      ],
      examTraps: [
        'Believing both partitions can commit data simultaneously. Quorum math forbids two simultaneous majorities.',
      ],
      mnemonic: 'M-M-W (Majority Makes Writes)',
    },
    {
      id: 'c-4',
      concept: 'Leader Completeness Property',
      weightage: 'medium',
      weightagePercentage: 15,
      whyHighWeightage: 'Distinguishes top grade students in theoretical consistency questions.',
      coreDefinition:
        'If a log entry is committed in a given term, that entry will be present in the logs of the leaders for all higher-numbered terms.',
      keyFormulasOrRules: [
        'Candidate Log Up-to-Date Rule: Voter denies vote if candidate log is less up-to-date than voter log.',
      ],
      examTraps: [
        'Comparing only log length instead of (lastLogTerm, then lastLogIndex).',
      ],
      mnemonic: 'T-I-L (Term first, then Index Length)',
    },
  ],
  examQuestions: [
    {
      id: 'q-1',
      category: '2-Mark Conceptual',
      marks: 2,
      question: 'Why are election timeouts in Raft chosen randomly from a range (e.g., 150ms-300ms) rather than fixed?',
      expectedKeywords: ['Split vote', 'Simultaneous timeout', 'Majority quorum', 'Symmetry breaking'],
      modelAnswer:
        'Election timeouts are randomized to break symmetry among followers. If all nodes had identical fixed timeouts, they would transition to Candidates simultaneously and split the votes evenly, leading to repeated split-vote deadlocks. Randomization ensures one candidate times out first and gathers a majority before others start.',
      examinerTip: 'Always mention "symmetry breaking" and "prevention of split-vote deadlock" for full 2 marks.',
    },
    {
      id: 'q-2',
      category: '5-Mark Analytical',
      marks: 5,
      question:
        'Explain how Raft ensures the Log Matching Property during AppendEntries RPC execution. What happens when a follower log conflicts with the leader?',
      expectedKeywords: ['prevLogIndex', 'prevLogTerm', 'Induction', 'Consistency check', 'Overwrite uncommitted'],
      modelAnswer:
        '1. Consistency Check: When the Leader sends an AppendEntries RPC, it includes `prevLogIndex` and `prevLogTerm` immediately preceding new entries.\n2. Follower Validation: The follower checks if its local log has an entry at `prevLogIndex` with matching `prevLogTerm`. If not, it rejects the RPC.\n3. Inductive Step: Because the initial empty log satisfies the property and each AppendEntries checks the previous entry, all preceding entries are guaranteed identical.\n4. Conflict Resolution: If a follower discovers a conflicting uncommitted entry, it deletes that entry and all following entries, then appends the leader entries.',
      examinerTip: 'Structure your answer into: Check -> Validation -> Induction -> Conflict Resolution with bullet points.',
    },
    {
      id: 'q-3',
      category: '10-Mark Deep Dive',
      marks: 10,
      question:
        'Consider a 5-node Raft cluster (A, B, C, D, E) with node A as Leader in Term 1. A network partition occurs separating {A, B} from {C, D, E}. Describe step-by-step: (a) what happens to incoming client writes in both partitions, (b) how a new leader is elected, and (c) how reconciliation occurs when the network heals.',
      expectedKeywords: ['Quorum', 'N/2 + 1', 'Minority partition', 'Majority partition', 'Higher term', 'Uncommitted rollback'],
      modelAnswer:
        'Part (a): Client Writes Behavior:\n- In partition {A, B} (minority: 2/5 nodes): Node A accepts writes locally, attempts AppendEntries, but can only gather 2 ACKs (A and B). Because 2 < 3 (majority), A cannot commit entries. Writes remain uncommitted and unacknowledged to clients.\n- In partition {C, D, E} (majority: 3/5 nodes): Once election completes, writes reach 3/3 nodes (majority), so entries are committed and applied to state machines.\n\nPart (b): Leader Election:\n- Nodes C, D, E stop receiving heartbeats from A. Their randomized election timers expire.\n- Suppose C times out first in Term 2. C votes for itself and broadcasts RequestVote to D and E.\n- Nodes D and E grant votes (3 votes total >= 3). Node C becomes Leader for Term 2 and starts sending heartbeats.\n\nPart (c): Network Reconciliation:\n- The partition heals. Node A sends an AppendEntries to C, D, or E.\n- Node A receives responses showing Term 2 > Term 1. Node A immediately steps down to Follower and updates its term to 2.\n- New Leader C asserts authority with AppendEntries. Leader C identifies that nodes A and B have uncommitted entries from Term 1 that conflict with C\'s log.\n- Followers A and B roll back their uncommitted Term 1 entries and overwrite them with Leader C\'s committed log up to date, restoring strict consensus.',
      examinerTip: 'Explicitly calculate majority quorum (5/2 + 1 = 3) and trace terms (Term 1 -> Term 2) clearly.',
    },
  ],
  flashcards: [
    {
      id: 'fc-1',
      front: 'What is the required quorum formula for a Raft cluster of N nodes?',
      back: 'Quorum = floor(N / 2) + 1. For example, in a 5-node cluster, at least 3 nodes must agree to elect a leader or commit a log.',
      topic: 'Leader Election',
      weightage: 'crucial',
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    },
    {
      id: 'fc-2',
      front: 'Why must Raft election timeouts be randomized between 150ms and 300ms?',
      back: 'To prevent split-vote deadlocks where multiple candidates time out simultaneously and divide votes equally.',
      topic: 'Leader Election',
      weightage: 'crucial',
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    },
    {
      id: 'fc-3',
      front: 'What two fields are sent in AppendEntries to enforce the Log Matching Property?',
      back: 'prevLogIndex and prevLogTerm. The follower rejects the RPC if its log does not match at that exact position.',
      topic: 'Log Replication',
      weightage: 'crucial',
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    },
    {
      id: 'fc-4',
      front: 'Can a Raft leader directly commit a log entry from a previous term by counting replicas?',
      back: 'NO! A leader cannot determine commitment for previous term entries solely by replicas. It must commit an entry from its CURRENT term.',
      topic: 'Safety Invariants',
      weightage: 'high',
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    },
    {
      id: 'fc-5',
      front: 'What happens when a Raft server receives an RPC with a term number greater than its own?',
      back: 'It immediately updates its currentTerm to the higher value and transitions to the Follower state.',
      topic: 'Node Dynamics',
      weightage: 'high',
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    },
    {
      id: 'fc-6',
      front: 'What is the "Leader Completeness" property in Raft?',
      back: 'If a log entry is committed in a given term, that entry will be present in the logs of all leaders for all higher-numbered terms.',
      topic: 'Safety Invariants',
      weightage: 'medium',
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    },
  ],
};

export const sampleCellularRespiration: StudyMaterial = {
  id: 'sample-bio-cellular',
  meta: {
    title: 'Cellular Respiration: Glycolysis, Krebs Cycle & Oxidative Phosphorylation',
    subject: 'Biochemistry & Cell Biology',
    targetExamLevel: 'AP Biology / MCAT / University Prelims',
    estimatedStudyTime: '40 mins',
    keyThemes: ['Glycolysis', 'Pyruvate Oxidation', 'Krebs (Citric Acid) Cycle', 'Electron Transport Chain', 'Chemiosmosis & ATP Yield'],
    sourceFileName: 'Cellular_Respiration_Biochemistry.pdf',
    generatedAt: new Date().toISOString(),
  },
  studySummary: {
    executiveOverview:
      'Cellular respiration is the catabolic pathway that breaks down glucose (C6H12O6) in the presence of oxygen to produce ATP, water, and carbon dioxide. The complete process consists of four stages: Glycolysis (cytosol), Pyruvate Oxidation (mitochondrial matrix), Citric Acid Cycle (mitochondrial matrix), and Oxidative Phosphorylation (inner mitochondrial cristae). Theoretical ATP yield ranges between 30-32 ATP per glucose molecule.',
    keyTakeaways: [
      'Substrate vs Oxidative Phosphorylation: Glycolysis and Krebs yield ATP via substrate-level phosphorylation; the ETC uses oxidative phosphorylation driven by proton gradients.',
      'Net Glycolysis Yield: 2 Pyruvate, 2 Net ATP, 2 NADH (from 1 Glucose).',
      'The Crucial Electron Carriers: 10 NADH + 2 FADH2 funnel high-energy electrons into Complex I and II of the Electron Transport Chain.',
      'Terminal Electron Acceptor: Molecular Oxygen (O2) acts as the final electron acceptor, reducing to form H2O.',
      'Proton Motive Force: H+ pumped into the intermembrane space creates an electrochemical gradient channeled through ATP Synthase.',
    ],
    corePrinciples: [
      {
        title: 'Chemiosmotic Coupling',
        description: 'Peter Mitchell hypothesis: electron transport creates a proton gradient across the inner membrane that powers ATP synthesis.',
        importance: 'Tested in 95% of biochemistry exams.',
      },
      {
        title: 'Redox Stoichiometry',
        description: 'Each NADH yields ~2.5 ATP, while each FADH2 yields ~1.5 ATP due to entering downstream at Complex II.',
        importance: 'Essential for numerical calculation questions.',
      },
      {
        title: 'Allosteric Regulation',
        description: 'Phosphofructokinase-1 (PFK-1) is the master pacemaker enzyme inhibited by high ATP and Citrate, activated by AMP.',
        importance: 'Top exam question on metabolic regulation.',
      },
    ],
    prerequisites: ['Redox reactions (NAD+/NADH)', 'Basic cell organelle structure', 'Thermodynamics of ATP hydrolysis'],
  },
  diagrams: [
    {
      id: 'diag-bio-flow',
      title: 'Four Stages of Aerobic Respiration Master Flowchart',
      type: 'flowchart',
      description: 'End-to-end biochemical roadmap tracking carbon atoms, electron carriers, and ATP production sites across cellular compartments.',
      mermaidCode: `flowchart TD
    classDef cyto fill:#0284c7,stroke:#0369a1,stroke-width:2px,color:#ffffff;
    classDef mito fill:#059669,stroke:#047857,stroke-width:2px,color:#ffffff;
    classDef etc fill:#7c3aed,stroke:#6d28d9,stroke-width:2px,color:#ffffff;
    classDef atp fill:#d97706,stroke:#b45309,stroke-width:2px,color:#ffffff;

    G[1x Glucose: 6 Carbon]:::cyto -->|Cytosol: Glycolysis| PYR[2x Pyruvate: 3 Carbon]:::cyto
    G -.->|Yields| A1[2 Net ATP + 2 NADH]:::atp
    PYR -->|Mitochondrial Matrix Entry| PO[Pyruvate Oxidation: Link Reaction]:::mito
    PO -->|Releases 2 CO2| AC[2x Acetyl-CoA: 2 Carbon]:::mito
    PO -.->|Yields| A2[2 NADH]:::atp
    AC -->|Condensation with Oxaloacetate| CAC[Citric Acid Cycle: 2 Turns]:::mito
    CAC -->|Releases 4 CO2| CAC_END[Cycle Regenerates Oxaloacetate]:::mito
    CAC -.->|Yields| A3[2 ATP/GTP + 6 NADH + 2 FADH2]:::atp
    A1 & A2 & A3 ==>|Electrons carried by 10 NADH + 2 FADH2| ETC[Oxidative Phosphorylation: Inner Membrane]:::etc
    ETC -->|Terminal Acceptor: O2 -> H2O| CHEMI[ATP Synthase via Chemiosmosis]:::atp
    CHEMI ==> TOTAL[Total Net Yield: 30-32 ATP]:::atp`,
      keyNodesExplaining: [
        {
          node: 'Glycolysis',
          explanation: 'Anaerobic conversion in the cytoplasm producing 2 net ATP via substrate-level phosphorylation and 2 NADH.',
          examSignificance: 'Does not require oxygen; works in both aerobic and anaerobic organisms.',
        },
        {
          node: 'Oxidative Phosphorylation',
          explanation: 'Generates ~26-28 ATP of the total ~30-32 ATP via the proton-motive force across the cristae.',
          examSignificance: 'Accounts for ~90% of total cellular ATP production.',
        },
      ],
    },
    {
      id: 'diag-bio-etc',
      title: 'Electron Transport Chain & Proton Motive Force Diagram',
      type: 'flowchart',
      description: 'Molecular pathway of electrons passing through Complexes I-IV and driving proton accumulation in the intermembrane space.',
      mermaidCode: `flowchart LR
    classDef complex fill:#475569,stroke:#334155,stroke-width:2px,color:#ffffff;
    classDef proton fill:#0284c7,stroke:#0369a1,stroke-width:2px,color:#ffffff;
    classDef atp fill:#059669,stroke:#047857,stroke-width:2px,color:#ffffff;

    NADH[NADH] -->|Donates 2 e-| C1[Complex I: NADH Dehydrogenase]:::complex
    C1 -->|Pumps 4 H+| H_SPACE[Intermembrane Space: High H+ Concentration]:::proton
    FADH2[FADH2] -->|Donates 2 e-| C2[Complex II: Succinate Dehydrogenase]:::complex
    C1 & C2 --> Q[Coenzyme Q: Ubiquinone]
    Q --> C3[Complex III: Cytochrome bc1]:::complex
    C3 -->|Pumps 4 H+| H_SPACE
    C3 --> CytC[Cytochrome c]
    CytC --> C4[Complex IV: Cytochrome c Oxidase]:::complex
    C4 -->|Pumps 2 H+| H_SPACE
    C4 -->|e- + 1/2 O2 + 2H+| H2O[Water H2O Formed]
    H_SPACE ==>|Proton Flow Down Gradient| SYN[ATP Synthase: F0 F1 Complex]:::atp
    SYN -->|ADP + Pi| ATP_OUT[ATP Synthesized]:::atp`,
      keyNodesExplaining: [
        {
          node: 'Complex I vs II',
          explanation: 'NADH enters at Complex I (pumps H+), while FADH2 enters at Complex II (does not pump H+ directly).',
          examSignificance: 'Why NADH produces 2.5 ATP while FADH2 produces only 1.5 ATP.',
        },
      ],
    },
  ],
  examConcepts: [
    {
      id: 'cb-1',
      concept: 'Chemiosmosis and the Proton-Motive Force',
      weightage: 'crucial',
      weightagePercentage: 40,
      whyHighWeightage: 'Central theme of bioenergetics; appears in multi-part essay and diagram questions.',
      coreDefinition:
        'The process in which energy stored in a hydrogen ion gradient across the inner mitochondrial membrane is used to drive cellular work, specifically the phosphorylation of ADP to ATP by ATP synthase.',
      keyFormulasOrRules: [
        'Total ATP per Glucose = ~30 to 32 ATP',
        '1 NADH -> ~2.5 ATP (10 H+ pumped per pair of electrons)',
        '1 FADH2 -> ~1.5 ATP (6 H+ pumped per pair of electrons)',
        'ATP Synthase: ~4 H+ per ATP synthesized (3 for rotation + 1 for Pi transport)',
      ],
      examTraps: [
        'Saying oxygen is converted to CO2 (False! Oxygen forms H2O at Complex IV; CO2 comes from Pyruvate Decarboxylation and Krebs cycle!).',
        'Confusing the intermembrane space (acidic/high H+) with the mitochondrial matrix (basic/low H+).',
      ],
      mnemonic: 'O-W-C-C: Oxygen makes Water; Carbons make CO2!',
    },
    {
      id: 'cb-2',
      concept: 'Substrate-Level vs Oxidative Phosphorylation',
      weightage: 'crucial',
      weightagePercentage: 30,
      whyHighWeightage: 'Standard comparison question (3-5 marks).',
      coreDefinition:
        'Substrate-level phosphorylation directly transfers a phosphate group from an organic substrate to ADP (Glycolysis & Krebs). Oxidative phosphorylation uses redox energy from electron transfer to synthesize ATP indirectly via ATP synthase.',
      keyFormulasOrRules: [
        'Substrate-level: 2 ATP (Glycolysis) + 2 ATP/GTP (Krebs) = 4 direct ATP.',
        'Oxidative: 26-28 ATP via ETC and Chemiosmosis.',
      ],
      examTraps: [
        'Failing to specify cellular locations for each mechanism.',
      ],
      mnemonic: 'S-D / O-G (Substrate is Direct, Oxidative is Gradient-driven)',
    },
    {
      id: 'cb-3',
      concept: 'Allosteric Regulation of PFK-1 (Phosphofructokinase-1)',
      weightage: 'high',
      weightagePercentage: 20,
      whyHighWeightage: 'Tests metabolic feedback loops and homeostatic control.',
      coreDefinition:
        'PFK-1 is the key regulatory enzyme of glycolysis catalyzing Fructose-6-phosphate to Fructose-1,6-bisphosphate. Inhibited by high ATP and Citrate; stimulated by AMP and Fructose-2,6-bisphosphate.',
      keyFormulasOrRules: [
        'High Energy Charge (High ATP/AMP ratio) -> Shuts down Glycolysis',
        'Low Energy Charge (High AMP) -> Activates Glycolysis',
      ],
      examTraps: [
        'Believing ATP is solely a substrate; in high concentrations, ATP binds the allosteric regulatory site to inhibit PFK-1.',
      ],
      mnemonic: 'A-A-C-A: AMP Activates, Citrate & ATP Arrest',
    },
  ],
  examQuestions: [
    {
      id: 'qb-1',
      category: '2-Mark Conceptual',
      marks: 2,
      question: 'What is the role of molecular oxygen in aerobic cellular respiration?',
      expectedKeywords: ['Terminal electron acceptor', 'Complex IV', 'Water formation', 'Prevents ETC backup'],
      modelAnswer:
        'Molecular oxygen acts as the final (terminal) electron acceptor at Complex IV of the Electron Transport Chain. It accepts electrons and binds with free protons in the mitochondrial matrix to form water (H2O). Without oxygen, electron flow ceases, the proton gradient collapses, and ATP synthesis stops.',
      examinerTip: 'Do NOT say oxygen burns glucose. Use the exact phrase "terminal electron acceptor".',
    },
    {
      id: 'qb-2',
      category: '5-Mark Analytical',
      marks: 5,
      question:
        'Compare the ATP yield of 1 molecule of NADH versus 1 molecule of FADH2 during oxidative phosphorylation. Explain the biochemical reason for the difference.',
      expectedKeywords: ['Complex I', 'Complex II', 'Proton pumping', '10 H+ vs 6 H+', '2.5 ATP vs 1.5 ATP'],
      modelAnswer:
        '1. Quantitative Difference: Oxidation of 1 NADH yields approximately 2.5 ATP, whereas 1 FADH2 yields approximately 1.5 ATP.\n2. Point of Entry: NADH enters the ETC at Complex I (NADH dehydrogenase), while FADH2 enters downstream at Complex II (succinate dehydrogenase).\n3. Proton Pumping Disparity: Electrons from NADH traverse Complex I (4 H+ pumped), Complex III (4 H+ pumped), and Complex IV (2 H+ pumped), translocating a total of 10 H+ into the intermembrane space.\n4. FADH2 enters at Complex II, which does not pump protons. Its electrons only traverse Complexes III and IV, translocating only 6 H+.\n5. Chemiosmotic Ratio: Since ATP synthase requires approximately 4 H+ per ATP synthesized, 10 H+ / 4 = 2.5 ATP (NADH) and 6 H+ / 4 = 1.5 ATP (FADH2).',
      examinerTip: 'Write down the exact proton tallies (10 H+ vs 6 H+) to guarantee 5/5 marks.',
    },
  ],
  flashcards: [
    {
      id: 'fcb-1',
      front: 'What is the net ATP and NADH yield from one molecule of glucose during glycolysis?',
      back: '2 Net ATP (4 generated minus 2 invested) and 2 NADH, along with 2 molecules of pyruvate.',
      topic: 'Glycolysis',
      weightage: 'crucial',
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    },
    {
      id: 'fcb-2',
      front: 'Where does the proton accumulation occur during mitochondrial electron transport?',
      back: 'In the intermembrane space (between inner and outer membranes), creating an electrochemical gradient relative to the matrix.',
      topic: 'Oxidative Phosphorylation',
      weightage: 'crucial',
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    },
    {
      id: 'fcb-3',
      front: 'Why does FADH2 yield fewer ATP than NADH?',
      back: 'FADH2 feeds electrons into Complex II instead of Complex I, bypassing the first proton pump and translocating only 6 H+ instead of 10 H+.',
      topic: 'Bioenergetics',
      weightage: 'crucial',
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    },
    {
      id: 'fcb-4',
      front: 'What is the master allosteric enzyme controlling the rate of glycolysis?',
      back: 'Phosphofructokinase-1 (PFK-1). It is allosterically inhibited by ATP and citrate, and activated by AMP and Fructose-2,6-bisphosphate.',
      topic: 'Enzyme Regulation',
      weightage: 'high',
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    },
  ],
};

export const sampleMaterialsList: SampleDocument[] = [
  {
    id: 'sample-cs-raft',
    title: 'Raft Consensus Algorithm & Replicated State Machines',
    subject: 'Computer Science',
    badge: '35% Exam Weightage',
    description: 'Leader election, log matching invariants, split-brain recovery, and RPC state transitions.',
    content: 'Full academic chapter on Raft Consensus Algorithm in Distributed Systems...',
    defaultData: sampleDistributedSystems,
  },
  {
    id: 'sample-bio-cellular',
    title: 'Cellular Respiration & Bioenergetics',
    subject: 'Biology & Biochemistry',
    badge: '40% Exam Weightage',
    description: 'Glycolysis, Citric Acid Cycle, Chemiosmosis, and Electron Transport Chain stoichiometry.',
    content: 'Comprehensive textbook unit on cellular respiration and ATP synthase mechanics...',
    defaultData: sampleCellularRespiration,
  },
];
