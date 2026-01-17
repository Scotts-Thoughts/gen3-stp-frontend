const application_settings = [
    // POKEMON CONFIG (components) ---------------------------------------------------------------------//
    [ "starterString",     "Beedrill", ],
    [ "pkmnNature",        "Adamant",  ],
    [ "pkmn_ability",      "Pressure", ], // false = ability 1, true = ability 2
    [ "hidden_power_type", "Electric", ],
    [ "hidden_power_index", 0, ],
    [ "pkmn_gender",       "Female",   ],
    [ "gameSelection",     "FireRed and LeafGreen", ],

    // USER CONFIG (components) ------------------------------------------------------------------------// 
    [ "graphicOverlay",             true,  ], //places a single image as the overlay  //MVP
    [ "frame",                      false, ], //shows overlay frame
    [ "gameArea",                   false, ], //shows green box to place game in
    [ "pokeballFloor",              false, ], //shows floor for Pokemon to stand on
    [ "dynamicOverlay",             false, ], //dynamically picks overlay graphics based on team slot 1
    [ "gametime",                   false, ], //shows gametime
    [ "pick",                       true,  ],
    [ "typeCalcs",                  true,  ], //turns on type effectiveness calculations
    [ "moveset",                    true,  ], //includes the moveset area and dynamic PP  //MVP
    [ "dynamicPower",               false, ], //dynamically calculates power based on type effectiveness
    [ "resets",                     false, ], //includes the resets graphics
    [ "stats",                      true,  ], //includes the dynamic stats  //MVP
    [ "movepool",                   false, ], //includes the movepool graphic
    [ "inventory",                  false, ], //includes the inventory graphic when in marts
    [ "battleStats",                false, ], //calculates stats with stage modifiers  //MVP
    [ "battleInfo",                 false, ], //includes rightBar battle graphic
    [ "conditions",                 false, ], //shows status conditions as pop ups
    [ "expBar",                     false, ], //includes a dynamic exp bar
    [ "splits",                     false, ], //shows splits when a major battle is complete
    [ "tooltips",                   false, ], //displays move tooltips when a new move is learned
    [ "btcInfo",                    false, ], //shows behind the scenes info in the game area
    [ "returnPower",                true,  ], //dynamically calculates the power of Return
    [ "gamestate",                  true,  ], //shows the current gamestate in the place of the timer
    [ "labels",                     true,  ], //shows the current gamestate in the place of the timer
    [ "tutor_moves",                false, ],
    [ "testStatus",                 false, ],
    [ "repel_counter",              true,  ],
    [ "vs_seeker",                  false, ],
    [ "autosplitter_toggle",        true,  ],
    [ "showSpecialTrainerGraphics", true,  ], 
    [ "league_rematches",           false, ],
    [ "unobtainable_moves_toggle",  "Always Cross Out", ],
    [ "banned_hidden_power",        true,  ],
    [ "post_kanto_evolutions",      false, ],
    [ "show_post_battle_splits",    true, ],

    //CSS styling values
    [ "statLabelOpacityValue", 0.1, ], //used when a stage modifier is applied

    //STATE MANAGEMENT ---------------------------------------------------------------------------------//
    [ "gamestateLogging",     false,        ],
    [ "gameStarted",          true,         ], //tracks if the player has a save game or not
    [ "currentGameStateNew",  "",           ],
    [ "playerID",             999,          ],
    [ "g3stateVariable",      "Base Stats", ],
    [ "prevSpecies",          undefined,    ],
    [ "prevExpPoints",        0,            ],
    [ "expDebounceTimeoutId", -1,           ],
    [ "expBarAnimation",      true,         ],
    [ "slotTimingFix",        false,        ],
    [ "showAllTrainers",      true,         ],
    [ "enemyModColour",       ["0", "background: #d84444;"], ],
    [ "enemyState",           "Pokemon",                     ],
    [ "field_array",          ["Reflect", 0],                ],
    [ "last_initiated_field_effect", "Reflect",              ],

    //Pokemon settings for local storage
     [ "overlay_color", "#000000", ],
     [ "imageXOffset",  0,         ],
     [ "imageYOffset",  0,         ],
     [ "imageScale",    1,         ],
     [ "imageFlip",     false,     ],
     [ "imageSat",      100,       ],
     [ "imageRotation", 0,         ],

    //background texture settings
    [ "backgroundBlur",        0,       ],
    [ "backgroundScale",       100,     ],
    [ "backgroundUrl",         "",      ],
    [ "backgroundFlip",        false,   ],
    [ "backgroundXFlip",       false,   ],
    [ "use_custom_background", false,   ],
    [ "backgroundXOffset",     0,       ],
    [ "backgroundYOffset",     0,       ],
    [ "backgroundTexture",     'Bug 1', ],
    [ "backgroundBrightness",  100,     ],
    [ "backgroundContrast",    100,     ],
    [ "backgroundSaturation",  100,     ],
    [ "backgroundHue",         0,       ],

    //timer variables
    [ "timer_startTimeOffset", "00:00:00.00", ],
    [ "time_split_start",      "00:00:00:00", ],
    [ "battle_start",          0,    ],

    //resets
    [ "playerId",            0,        ],
    [ "playerName",          "",       ],
    [ "resetCatcher",        "NINTEN", ],
    [ "playerResets",        0,        ],
    [ "blackout_counter",    0,        ],
    [ "resetCounter",        true,     ],
    [ "game_over",           false,    ],
    [ "hallOfFameReset",     false,    ],
    [ "finished_logs",       false,    ],
    [ "pb_time",             "None",   ],
    [ "split_logStr",        "",       ],
    [ "attempt_number",      0,        ],
    [ "finished_run_count",  0,        ],
    [ "split_data",          [],       ],
    [ "simple_data_str",     "",       ],
    [ "full_data_str",       "",       ],
    [ "deprecated_data_str", "",       ],
    [ "simple_data",         "",       ],
    [ "testRun",             false,    ],

    //movepool starting parameters. set to -1 if not initialized
    [ "movepoolDefaultFontSize",        -1, ],
    [ "movepoolDefaultLineHeight",      -1, ],
    [ "movepoolDefaultContainerHeight", -1, ],
   
    //catch rate
    [ "catch_rate",   false, ],

    //encounters
    [ "route_101",       true, ],
    [ "route_102",       true, ],
    [ "route_103",       true, ],
    [ "route_1",         true, ],
    [ "route_2",         true, ],
    [ "route_22",        true, ],
    [ "viridian_forest", true, ],
    [ "route_6",         true, ],

    //HM flags
    [ "hm_102_zigzagoon",   true, ],
    [ "hm_104_marill",      true, ],
    [ "hm_104_taillow",     true, ],
    [ "hm_116_abra",        false, ],
    [ "hm_woods_shroomish", false, ],
    [ "hm_cave_abra",       false, ],

    [ "hm_1_pidgey",        true, ],
    [ "hm_1_rattata",       true, ],

    // UI
    [ "ui_saturation",          .6,                   ],
    [ "ui_type_colors",         "Bulbapedia Current", ],
    [ "ui_type_color_modifier", "current_",           ],
    [ "ui_type_icons",          "2024",               ],
    [ "ui_type_icons_modifier", "2024/",              ],

    [ "right_panel", 'Movepool',       ],
    [ "copy_overlay_pokemon_from", "", ],
    [ "copy_overlay_pokemon_to",   "", ],
]
