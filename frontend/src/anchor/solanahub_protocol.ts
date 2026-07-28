/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solanahub_protocol.json`.
 */
export type SolanahubProtocol = {
  "address": "F65dyNspaW3225BEuJh2W7wnigtdVjxnmeFxXPFr5Rpm",
  "metadata": {
    "name": "solanahubProtocol",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "approveMilestone",
      "docs": [
        "Approve a submitted milestone"
      ],
      "discriminator": [
        145,
        85,
        92,
        60,
        50,
        130,
        219,
        106
      ],
      "accounts": [
        {
          "name": "project",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "milestone",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  108,
                  101,
                  115,
                  116,
                  111,
                  110,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              },
              {
                "kind": "arg",
                "path": "milestoneIndex"
              }
            ]
          }
        },
        {
          "name": "client",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "assignFreelancer",
      "docs": [
        "Assign a freelancer to the project"
      ],
      "discriminator": [
        27,
        101,
        101,
        33,
        185,
        240,
        49,
        35
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "caller",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "freelancer",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "castVote",
      "docs": [
        "Cast a vote in a dispute"
      ],
      "discriminator": [
        20,
        212,
        15,
        189,
        69,
        180,
        69,
        151
      ],
      "accounts": [
        {
          "name": "dispute",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  105,
                  115,
                  112,
                  117,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "dispute.project_id",
                "account": "dispute"
              },
              {
                "kind": "account",
                "path": "dispute.milestone_index",
                "account": "dispute"
              }
            ]
          }
        },
        {
          "name": "voter",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": {
            "defined": {
              "name": "vote"
            }
          }
        }
      ]
    },
    {
      "name": "createMilestone",
      "docs": [
        "Create a milestone for the project"
      ],
      "discriminator": [
        239,
        58,
        201,
        28,
        40,
        186,
        173,
        48
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "milestone",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  108,
                  101,
                  115,
                  116,
                  111,
                  110,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              },
              {
                "kind": "arg",
                "path": "milestoneIndex"
              }
            ]
          }
        },
        {
          "name": "client",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u8"
        },
        {
          "name": "descriptionHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createPost",
      "docs": [
        "Create a social post"
      ],
      "discriminator": [
        123,
        92,
        184,
        29,
        231,
        24,
        15,
        202
      ],
      "accounts": [
        {
          "name": "post",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "author"
              },
              {
                "kind": "arg",
                "path": "contentHash"
              }
            ]
          }
        },
        {
          "name": "author",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "contentHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "postType",
          "type": {
            "defined": {
              "name": "postType"
            }
          }
        }
      ]
    },
    {
      "name": "createProject",
      "docs": [
        "Create a new freelance project"
      ],
      "discriminator": [
        148,
        219,
        181,
        42,
        221,
        114,
        145,
        190
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "client",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "descriptionHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "totalBudget",
          "type": "u64"
        },
        {
          "name": "milestoneCount",
          "type": "u8"
        },
        {
          "name": "deadline",
          "type": "i64"
        },
        {
          "name": "category",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize global state"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeEscrow",
      "docs": [
        "Initialize the escrow for the project"
      ],
      "discriminator": [
        243,
        160,
        77,
        153,
        11,
        92,
        48,
        209
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "client",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "clientAta",
          "writable": true
        },
        {
          "name": "escrowVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrow"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "u64"
        },
        {
          "name": "milestoneAmounts",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "likePost",
      "docs": [
        "Like a social post"
      ],
      "discriminator": [
        45,
        242,
        154,
        71,
        63,
        133,
        54,
        186
      ],
      "accounts": [
        {
          "name": "post",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "like",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "post"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "postId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "processAutoRelease",
      "docs": [
        "Process auto-release for a milestone"
      ],
      "discriminator": [
        176,
        110,
        179,
        147,
        135,
        39,
        248,
        221
      ],
      "accounts": [
        {
          "name": "project",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "milestone",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  108,
                  101,
                  115,
                  116,
                  111,
                  110,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              },
              {
                "kind": "arg",
                "path": "milestoneIndex"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "raiseDispute",
      "docs": [
        "Raise a dispute for a project milestone"
      ],
      "discriminator": [
        41,
        243,
        1,
        51,
        150,
        95,
        246,
        73
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "dispute",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  105,
                  115,
                  112,
                  117,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              },
              {
                "kind": "arg",
                "path": "milestoneIndex"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true
        },
        {
          "name": "initiator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "u64"
        },
        {
          "name": "milestoneIndex",
          "type": "u8"
        },
        {
          "name": "descriptionHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "rejectMilestone",
      "docs": [
        "Reject a submitted milestone"
      ],
      "discriminator": [
        243,
        48,
        66,
        165,
        237,
        41,
        116,
        249
      ],
      "accounts": [
        {
          "name": "project",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "milestone",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  108,
                  101,
                  115,
                  116,
                  111,
                  110,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              },
              {
                "kind": "arg",
                "path": "milestoneIndex"
              }
            ]
          }
        },
        {
          "name": "client",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "releaseMilestone",
      "docs": [
        "Release funds for a milestone"
      ],
      "discriminator": [
        56,
        2,
        199,
        164,
        184,
        108,
        167,
        222
      ],
      "accounts": [
        {
          "name": "project",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "milestone",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  108,
                  101,
                  115,
                  116,
                  111,
                  110,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              },
              {
                "kind": "arg",
                "path": "milestoneIndex"
              }
            ]
          }
        },
        {
          "name": "client",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "sendMessage",
      "docs": [
        "Send a message"
      ],
      "discriminator": [
        57,
        40,
        34,
        178,
        189,
        10,
        65,
        26
      ],
      "accounts": [
        {
          "name": "thread",
          "writable": true
        },
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "recipient"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "contentHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "stake",
      "docs": [
        "Stake tokens"
      ],
      "discriminator": [
        206,
        176,
        202,
        18,
        200,
        209,
        179,
        108
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userStake",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "stakingVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "submitDeliverable",
      "docs": [
        "Submit deliverable for a milestone"
      ],
      "discriminator": [
        38,
        137,
        64,
        44,
        237,
        11,
        125,
        101
      ],
      "accounts": [
        {
          "name": "project",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "milestone",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  108,
                  101,
                  115,
                  116,
                  111,
                  110,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "project.project_id",
                "account": "project"
              },
              {
                "kind": "arg",
                "path": "milestoneIndex"
              }
            ]
          }
        },
        {
          "name": "freelancer",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u8"
        },
        {
          "name": "deliverableHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "submitReview",
      "docs": [
        "Submit a review for a project"
      ],
      "discriminator": [
        106,
        30,
        50,
        83,
        89,
        46,
        213,
        239
      ],
      "accounts": [
        {
          "name": "project",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "reviewer",
          "writable": true,
          "signer": true
        },
        {
          "name": "targetUser"
        },
        {
          "name": "reputation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  112,
                  117,
                  116,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "targetUser"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "u64"
        },
        {
          "name": "rating",
          "type": "u8"
        },
        {
          "name": "commentHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "dispute",
      "discriminator": [
        36,
        49,
        241,
        67,
        40,
        36,
        241,
        74
      ]
    },
    {
      "name": "escrow",
      "discriminator": [
        31,
        213,
        123,
        187,
        186,
        22,
        218,
        155
      ]
    },
    {
      "name": "globalState",
      "discriminator": [
        163,
        46,
        74,
        168,
        216,
        123,
        133,
        98
      ]
    },
    {
      "name": "like",
      "discriminator": [
        10,
        133,
        129,
        201,
        87,
        218,
        203,
        222
      ]
    },
    {
      "name": "messageThread",
      "discriminator": [
        8,
        5,
        87,
        116,
        54,
        3,
        109,
        120
      ]
    },
    {
      "name": "milestone",
      "discriminator": [
        38,
        210,
        239,
        177,
        85,
        184,
        10,
        44
      ]
    },
    {
      "name": "post",
      "discriminator": [
        8,
        147,
        90,
        186,
        185,
        56,
        192,
        150
      ]
    },
    {
      "name": "project",
      "discriminator": [
        205,
        168,
        189,
        202,
        181,
        247,
        142,
        19
      ]
    },
    {
      "name": "reputation",
      "discriminator": [
        55,
        148,
        90,
        71,
        68,
        183,
        193,
        28
      ]
    },
    {
      "name": "userStake",
      "discriminator": [
        102,
        53,
        163,
        107,
        9,
        138,
        87,
        153
      ]
    }
  ],
  "events": [
    {
      "name": "disputeRaisedEvent",
      "discriminator": [
        89,
        136,
        174,
        60,
        243,
        203,
        120,
        85
      ]
    },
    {
      "name": "escrowInitializedEvent",
      "discriminator": [
        17,
        220,
        22,
        132,
        33,
        81,
        105,
        59
      ]
    },
    {
      "name": "messageSent",
      "discriminator": [
        116,
        70,
        224,
        76,
        128,
        28,
        110,
        55
      ]
    },
    {
      "name": "milestoneReleasedEvent",
      "discriminator": [
        232,
        117,
        63,
        24,
        141,
        213,
        188,
        14
      ]
    },
    {
      "name": "projectCreatedEvent",
      "discriminator": [
        211,
        119,
        21,
        209,
        113,
        178,
        141,
        38
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "titleTooLong",
      "msg": "Title too long (max 128 characters)"
    },
    {
      "code": 6001,
      "name": "invalidMilestoneCount",
      "msg": "Invalid milestone count (must be 1-10)"
    },
    {
      "code": 6002,
      "name": "invalidDeadline",
      "msg": "Invalid deadline (must be in the future)"
    },
    {
      "code": 6003,
      "name": "unauthorized",
      "msg": "Unauthorized action"
    },
    {
      "code": 6004,
      "name": "freelancerAlreadyAssigned",
      "msg": "Project already has a freelancer assigned"
    },
    {
      "code": 6005,
      "name": "alreadyReleased",
      "msg": "Milestone already released"
    },
    {
      "code": 6006,
      "name": "invalidMilestoneIndex",
      "msg": "Invalid milestone index"
    },
    {
      "code": 6007,
      "name": "invalidProjectStatus",
      "msg": "Invalid project status for this operation"
    },
    {
      "code": 6008,
      "name": "invalidMilestoneStatus",
      "msg": "Invalid milestone status"
    },
    {
      "code": 6009,
      "name": "insufficientBalance",
      "msg": "Insufficient escrow balance"
    },
    {
      "code": 6010,
      "name": "autoReleaseNotReady",
      "msg": "Auto-release not ready (must wait 7 days)"
    },
    {
      "code": 6011,
      "name": "invalidRating",
      "msg": "Invalid rating (must be 1-5)"
    }
  ],
  "types": [
    {
      "name": "dispute",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "disputeId",
            "type": "u64"
          },
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "milestoneIndex",
            "type": "u8"
          },
          {
            "name": "initiator",
            "type": "pubkey"
          },
          {
            "name": "respondent",
            "type": "pubkey"
          },
          {
            "name": "descriptionHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "disputeStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "resolvedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "disputeRaisedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "disputeId",
            "type": "u64"
          },
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "milestoneIndex",
            "type": "u8"
          },
          {
            "name": "initiator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "disputeStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "voting"
          },
          {
            "name": "resolved"
          }
        ]
      }
    },
    {
      "name": "escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "projectPda",
            "type": "pubkey"
          },
          {
            "name": "client",
            "type": "pubkey"
          },
          {
            "name": "freelancer",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "amountReleased",
            "type": "u64"
          },
          {
            "name": "milestoneAmounts",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "escrowInitializedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalProjects",
            "type": "u64"
          },
          {
            "name": "totalDisputes",
            "type": "u64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "like",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "post",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "messageSent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "threadId",
            "type": "pubkey"
          },
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "contentHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "messageThread",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "participantA",
            "type": "pubkey"
          },
          {
            "name": "participantB",
            "type": "pubkey"
          },
          {
            "name": "lastMessageAt",
            "type": "i64"
          },
          {
            "name": "messageCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "milestone",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "milestoneIndex",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "milestoneStatus"
              }
            }
          },
          {
            "name": "descriptionHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "deliverableHash",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "submittedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "milestoneReleasedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "milestoneIndex",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "milestoneStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "active"
          },
          {
            "name": "submitted"
          },
          {
            "name": "approved"
          },
          {
            "name": "released"
          },
          {
            "name": "disputed"
          }
        ]
      }
    },
    {
      "name": "post",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "contentHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "postType",
            "type": {
              "defined": {
                "name": "postType"
              }
            }
          },
          {
            "name": "likes",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "postType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "portfolio"
          },
          {
            "name": "jobListing"
          },
          {
            "name": "update"
          }
        ]
      }
    },
    {
      "name": "project",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "client",
            "type": "pubkey"
          },
          {
            "name": "freelancer",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "descriptionHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "totalBudget",
            "type": "u64"
          },
          {
            "name": "milestoneCount",
            "type": "u8"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "projectStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "category",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "projectCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "client",
            "type": "pubkey"
          },
          {
            "name": "totalBudget",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "projectStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "assigned"
          },
          {
            "name": "inProgress"
          },
          {
            "name": "completed"
          },
          {
            "name": "disputed"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "reputation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "totalReviews",
            "type": "u64"
          },
          {
            "name": "totalScore",
            "type": "u64"
          },
          {
            "name": "averageRating",
            "type": "u8"
          },
          {
            "name": "badges",
            "type": "u8"
          },
          {
            "name": "totalEarnings",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userStake",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "since",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vote",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "forInitiator"
          },
          {
            "name": "forRespondent"
          },
          {
            "name": "abstain"
          }
        ]
      }
    }
  ]
};
