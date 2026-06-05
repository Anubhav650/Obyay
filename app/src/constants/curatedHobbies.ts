import type { Hobby } from '../types/models';

export const CURATED_HOBBIES: Hobby[] = [
  {
    id: 'curated-guitar',
    name: 'Guitar Basics',
    level: 'beginner',
    category: 'music',
    summary: 'A beginner-friendly roadmap to get comfortable with the guitar, master open chords, and strum your first songs.',
    createdAt: new Date().toISOString(),
    techniques: [
      {
        id: 'cg-1',
        name: 'Fretboard Navigation',
        description: 'Understand string numbering (1-6), fret positions, and how to read basic guitar tab coordinates.',
        whyItMatters: 'It is the baseline coordinate system for playing any chord or melody.',
        order: 1,
        searchQuery: 'guitar fretboard navigation beginner tutorial',
        status: 'pending',
        statusUpdatedAt: null,
        resources: null,
        quiz: {
          question: 'Which string is the thinnest and highest-pitched string on a standard guitar?',
          options: [
            'The 6th string (Low E)',
            'The 1st string (High E)',
            'The 3rd string (G)',
            'The 5th string (A)'
          ],
          correctIndex: 1,
          explanation: 'Standard guitar strings are numbered 1 through 6, starting from the thinnest, highest-pitched string (1st string, High E) to the thickest, lowest-pitched string (6th string, Low E).'
        },
        flashcards: [
          {
            front: 'String Order (Thickest to Thinnest)',
            back: 'E, A, D, G, B, e (6th string to 1st string).'
          },
          {
            front: 'What does a fret represent?',
            back: 'The metal strips along the neck. Pressing behind a fret shortens the string length to raise the pitch.'
          }
        ]
      },
      {
        id: 'cg-2',
        name: 'Open Chords (G, C, D)',
        description: 'Learn the finger placements for G Major, C Major, and D Major chords in the open position near the headstock.',
        whyItMatters: 'These three chords form the foundation of thousands of famous popular songs.',
        order: 2,
        searchQuery: 'guitar open chords G C D tutorial',
        status: 'pending',
        statusUpdatedAt: null,
        resources: null,
        quiz: {
          question: 'Which of these chords requires placing fingers on the 1st, 2nd, and 6th strings in the 3rd fret?',
          options: [
            'D Major',
            'C Major',
            'G Major',
            'A Minor'
          ],
          correctIndex: 2,
          explanation: 'G Major is standardly played by placing fingers on the 6th string (3rd fret), 5th string (2nd fret), and thinnest 1st/2nd strings (3rd fret).'
        },
        flashcards: [
          {
            front: 'Open Chords Definition',
            back: 'Chords played at the top of the neck that include one or more unfretted (open) strings.'
          },
          {
            front: 'Common G-C-D Progression',
            back: 'A standard progression used in rock, folk, and pop, representing the I - IV - V chords in the key of G.'
          }
        ]
      },
      {
        id: 'cg-3',
        name: '4/4 Strumming Pattern',
        description: 'Practice the standard down-up strumming rhythm (Down, Down-Up, Up-Down-Up) in 4/4 timing.',
        whyItMatters: 'Keeping steady time is more important for making music than playing perfect notes.',
        order: 3,
        searchQuery: 'guitar beginner 4/4 strumming pattern',
        status: 'pending',
        statusUpdatedAt: null,
        resources: null,
        quiz: {
          question: 'What is the most critical rule when practicing strumming rhythms?',
          options: [
            'Strum as fast as possible',
            'Keep your strumming hand elbow rigid',
            'Maintain a continuous, relaxed down-up elbow/wrist motion',
            'Only strum down-strokes'
          ],
          correctIndex: 2,
          explanation: 'Keeping a continuous, relaxed up-and-down motion with your hand acts as a natural metronome, even if you do not strike the strings on every pass.'
        },
        flashcards: [
          {
            front: '4/4 Time Signature',
            back: 'A time signature where there are 4 beats in a measure, and the quarter note gets one beat.'
          },
          {
            front: 'The "Classic" Strumming Rhythm',
            back: 'Down... Down-Up... Up-Down-Up (D, D-U, U-D-U) is the most versatile pattern.'
          }
        ]
      },
      {
        id: 'cg-4',
        name: 'The Chromatic Spider Walk',
        description: 'Practice placing one finger per fret sequentially down a single string (frets 1-2-3-4) then switching strings.',
        whyItMatters: 'Builds essential left-hand finger strength, calluses, and coordination.',
        order: 4,
        searchQuery: 'guitar spider walk coordination exercise',
        status: 'pending',
        statusUpdatedAt: null,
        resources: null,
        quiz: {
          question: 'What is the primary benefit of the "Spider Walk" finger exercise?',
          options: [
            'It helps you memorize chord structures',
            'It trains individual finger independence and strength',
            'It teaches you how to tune the guitar',
            'It builds strumming speed'
          ],
          correctIndex: 1,
          explanation: 'The Spider Walk isolates each finger, forcing you to stretch and press notes cleanly, building dexterity and individual muscle memory.'
        },
        flashcards: [
          {
            front: 'Fretting Finger Placement',
            back: 'Place your finger just behind the metal fret wire, not directly on top of it, for a clean buzz-free note.'
          },
          {
            front: 'Dexterity Goal',
            back: 'Keep fingers hovering close to the fretboard rather than flying away when not fretting.'
          }
        ]
      },
      {
        id: 'cg-5',
        name: 'Smooth Chord Transitions',
        description: 'Practice transitioning slowly between G, C, and D chords, focusing on moving all fingers simultaneously.',
        whyItMatters: 'Allows you to play songs fluidly without awkward pauses between chord changes.',
        order: 5,
        searchQuery: 'guitar switch chords faster tutorial',
        status: 'pending',
        statusUpdatedAt: null,
        resources: null,
        quiz: {
          question: 'What is an "anchor finger" in chord transitions?',
          options: [
            'A finger that remains on the same string/fret during a chord change',
            'The finger that presses the hardest',
            'The thumb behind the neck',
            'The pinky finger resting on the guitar body'
          ],
          correctIndex: 0,
          explanation: 'An anchor finger is a finger common to both chords that does not need to lift during the transition, providing a pivot point for faster changes.'
        },
        flashcards: [
          {
            front: 'Anchor Finger Example',
            back: 'When transitioning from C Major to A Minor, the index and middle fingers stay in place.'
          },
          {
            front: 'Visualizing Chords',
            back: 'Form the shape of the next chord in the air before your fingers touch the fretboard.'
          }
        ]
      }
    ]
  },
  {
    id: 'curated-chess',
    name: 'Chess Strategies',
    level: 'intermediate',
    category: 'strategy',
    summary: 'Master opening principles, develop minor pieces, castle early, and learn fundamental tactical forks and pins.',
    createdAt: new Date().toISOString(),
    techniques: [
      {
        id: 'cc-1',
        name: 'Center Control',
        description: 'Move pawns to e4/d4 (or e5/d5 as black) to occupy and influence the central squares in the opening.',
        whyItMatters: 'Controlling the center gives your pieces freedom of movement while cramping your opponent.',
        order: 1,
        searchQuery: 'chess control the center opening tutorial',
        status: 'pending',
        statusUpdatedAt: null,
        resources: null,
        quiz: {
          question: 'Why is controlling the center (e4, d4, e5, d5) so important in the opening?',
          options: [
            'It protects your rooks from attack',
            'Pieces situated in the center control more squares and have maximum mobility',
            'It lets you checkmate the opponent in 3 moves',
            'It prevents the opponent from castling'
          ],
          correctIndex: 1,
          explanation: 'Centrally placed pieces act like hubs; knights control 8 squares, and bishops/queens sweep across both diagonals.'
        },
        flashcards: [
          {
            front: 'The 4 Central Squares',
            back: 'e4, d4, e5, and d5 are the critical squares in Chess.'
          },
          {
            front: 'Opening Goal',
            back: 'Control the center, develop minor pieces, and secure king safety.'
          }
        ]
      },
      {
        id: 'cc-2',
        name: 'Minor Piece Development',
        description: 'Develop knights and bishops early to active squares where they can coordinate and prepare for castling.',
        whyItMatters: 'Knights and bishops are your primary skirmishers; leaving them home is like fighting with one arm.',
        order: 2,
        searchQuery: 'chess develop knights and bishops principles',
        status: 'pending',
        statusUpdatedAt: null,
        resources: null,
        quiz: {
          question: 'Which minor piece is generally developed first in classic king-pawn openings?',
          options: [
            'The Queen',
            'The King\'s Knight (to f3/f6)',
            'The Queen\'s Rook',
            'The King\'s Bishop'
          ],
          correctIndex: 1,
          explanation: 'Developing the knight to f3 (for white) attacks the center, coordinates safety, and clears the path to castle early.'
        },
        flashcards: [
          {
            front: 'Minor Pieces',
            back: 'Bishops and Knights (valued at roughly 3 pawns each).'
          },
          {
            front: 'Development Blunder',
            back: 'Moving the same piece twice in the opening instead of developing other sleeping pieces.'
          }
        ]
      },
      {
        id: 'cc-3',
        name: 'King Castling',
        description: 'Perform the castling move (move king two squares toward rook, rook jumps over) to secure your king.',
        whyItMatters: 'An uncastled king in the center is highly vulnerable to devastating checks and pins.',
        order: 3,
        searchQuery: 'chess how to castle and castling rules',
        status: 'pending',
        statusUpdatedAt: null,
        resources: null,
        quiz: {
          question: 'In which of the following scenarios is castling ILLEGAL?',
          options: [
            'Your rooks are already developed',
            'There are pieces between the king and the rook',
            'The king is currently in check or moves through a square attacked by an opponent\'s piece',
            'It is past move 10'
          ],
          correctIndex: 2,
          explanation: 'You cannot castle if the king is currently in check, if the king passes through check, or if there are pieces in between.'
        },
        flashcards: [
          {
            front: 'Kingside vs Queenside Castling',
            back: 'Kingside (short) castling is faster; Queenside (long) castling leaves the king further from the corner.'
          },
          {
            front: 'Rook Benefit',
            back: 'Castling tucks the king away and activates the rook by bringing it toward the center.'
          }
        ]
      },
      {
        id: 'cc-4',
        name: 'Tactical Forks',
        description: 'Identify opportunities to attack two of your opponent\'s pieces simultaneously with a single piece.',
        whyItMatters: 'Forks force your opponent to defend one piece while you capture the other, winning material.',
        order: 4,
        searchQuery: 'chess tactical forks forks and double attacks',
        status: 'pending',
        statusUpdatedAt: null,
        resources: null,
        quiz: {
          question: 'Which piece is famously known for its ability to deliver devastating forks due to its L-shaped movement?',
          options: [
            'The Bishop',
            'The Knight',
            'The Rook',
            'The Pawn'
          ],
          correctIndex: 1,
          explanation: 'Knights are the ultimate forking pieces because they can hop over blockages and attack multiple pieces without being easily blocked.'
        },
        flashcards: [
          {
            front: 'Fork Definition',
            back: 'A double attack where a single piece attacks two or more target pieces at the same time.'
          },
          {
            front: 'Royal Fork',
            back: 'A fork that attacks the King and Queen simultaneously, usually winning the Queen.'
          }
        ]
      },
      {
        id: 'cc-5',
        name: 'Tactical Pins',
        description: 'Attack a piece that cannot move without exposing a more valuable piece behind it.',
        whyItMatters: 'Restricts your opponent\'s piece movements and allows you to pile up attackers on the pinned target.',
        order: 5,
        searchQuery: 'chess pins tactics absolute relative pin',
        status: 'pending',
        statusUpdatedAt: null,
        resources: null,
        quiz: {
          question: 'What is the difference between an "absolute pin" and a "relative pin"?',
          options: [
            'An absolute pin is played by a rook, relative pin by a bishop',
            'An absolute pin pins a piece to the King (making moves illegal); a relative pin pins it to a valuable piece (moves are legal but bad)',
            'Absolute pins can only happen on the center rows',
            'Relative pins only occur in endgames'
          ],
          correctIndex: 1,
          explanation: 'Absolute pins involve the King; moving the pinned piece would expose the King to check, which is illegal. Relative pins involve other pieces (like the Queen).'
        },
        flashcards: [
          {
            front: 'Pinning Pieces',
            back: 'Bishops, Rooks, and Queens (pieces that move in straight lines over distance).'
          },
          {
            front: 'Attacking Pinned Pieces',
            back: 'The classic rule: "Pile up attackers on the pinned piece" (often using pawns).'
          }
        ]
      },
      {
        id: 'cc-6',
        name: 'King and Queen Mate',
        description: 'Learn the technique to push an opponent\'s lone king to the edge of the board using your king and queen.',
        whyItMatters: 'It is the most common winning endgame scenario; failing to mate results in a draw (stalemate).',
        order: 6,
        searchQuery: 'chess king and queen checkmate endgame guide',
        status: 'pending',
        statusUpdatedAt: null,
        resources: null,
        quiz: {
          question: 'What major trap must you avoid when delivering King and Queen mate against a lone King?',
          options: [
            'Losing your king',
            'Accidental stalemate (leaving the opponent with zero legal moves when not in check)',
            'Running out of time on turn 40',
            'Pushing the king to the center'
          ],
          correctIndex: 1,
          explanation: 'Stalemate is a draw. When boxing the king in, always make sure the opponent\'s king has at least one escape square unless you are delivering direct check.'
        },
        flashcards: [
          {
            front: 'Stalemate vs Checkmate',
            back: 'Checkmate: King is in check and cannot escape (Win). Stalemate: King is NOT in check but has no legal moves (Draw).'
          },
          {
            front: 'Box Method',
            back: 'Using the Queen to create a shrinking box that restricts the enemy King to the edge.'
          }
        ]
      }
    ]
  }
];
