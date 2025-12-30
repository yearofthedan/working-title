import type { StoryProject } from '@features/shared/dataSpec'

export const fullSampleData: StoryProject = {
  schemaVersion: '1.0.0',
  projectId: 'proj_1984_complete',
  templateId: 'snowflake-method-v1',
  templateVersion: '1.0.0',
  meta: {
    name: '1984 (Completed Draft)',
    created: '1948-06-08T10:00:00Z',
    lastModified: '2025-12-29T14:30:00Z',
  },
  nodes: [
    // --- Context ---
    { id: 'n_genre', stepId: 'step-genre', content: { text: 'Dystopian / Political Fiction' } },
    { id: 'n_audience', stepId: 'step-target-audience', content: { text: 'Adult / Literary' } },
    {
      id: 'n_theme',
      stepId: 'step-theme',
      content: { text: 'The fragility of individual memory against state power.' },
    },

    // --- CHARACTER TREE (The "Bible") ---
    // Winston (Protagonist)
    {
      id: 'c_win_s',
      stepId: 'step-char-summary',
      content: {
        text: `
          <p><strong>Name:</strong> Winston Smith</p>
          
          <p><strong>Motivation (The Why):</strong> A deep-seated, instinctual need for objective truth and 
          historical continuity in a world where both have been abolished.</p>
          
          <p><strong>Goal (The What):</strong> To find a shred of evidence—a photograph, a document, 
          or a memory—that proves the Party is lying about the past, and to find a person with 
          whom he can share a genuine human connection.</p>
          
          <p><strong>Conflict (The Obstacle):</strong> A surveillance state that can read his expressions, 
          neighbors who would betray him for a chocolate ration, and his own paralyzing fear 
          of the Ministry of Love.</p>
          
          <p><strong>Epiphany (The Change):</strong> He realizes that no amount of intellectual 
          rebellion matters if the Party can force you to stop loving another person; once they 
          control your heart, they control reality itself.</p>
          
          <p><strong>Summary Arc:</strong> Winston moves from a state of silent, internal rebellion 
          to active, physical defiance through his affair with Julia. He believes he has found 
          a sanctuary, but his journey ultimately leads to the complete annihilation of his 
          will. He ends the story not as a martyr, but as a hollow man who genuinely loves 
          Big Brother.</p>
        `,
      },
    },
    {
      id: 'c_win_p',
      stepId: 'step-major-char',
      content: {
        text: `
          <p>Winston Smith is a remnant of a forgotten world, a man who remembers a time 
          before the Revolution but cannot be sure if those memories are real or 
          hallucinations. Physically, he is the embodiment of the Party’s neglect: 
          frail, with a face that is naturally sanguine but now greyed by poor diet and 
          the constant throb of a varicose ulcer on his right ankle. He is 39 years old, 
          yet he feels twice that, his body a map of the minor miseries of Oceania.</p>
    
          <p>His internal life is a desperate struggle against the 'Newspeak' that seeks to 
          abolish his thoughts. He works in the Records Department of the Ministry of 
          Truth, a job that requires him to be a professional liar—rewriting history 
          every day to match the Party's latest pronouncements. This proximity to the 
          machinery of deception is what fuel's his rebellion; he knows the past is being 
          erased because he is the one holding the eraser.</p>
    
          <p>His deepest trauma is the disappearance of his mother and young sister. He has 
          a recurring dream of them in a sinking ship, looking up at him with eyes full of 
          a tragic, quiet love that no longer exists in the world of Big Brother. This 
          memory is his anchor to humanity. He doesn't want to be a hero; he just wants to 
          be a person who is allowed to remember his own life. This vulnerability is 
          precisely what O'Brien will eventually exploit to break him.</p>
    
          <p>He is a man of contradictions: he is terrified of the Thought Police, yet he 
          buys a diary that ensures his eventual arrest. He hates the dark-haired girl 
          because she seems like a perfect Party zealot, yet he is drawn to her because 
          she represents the physical life he has been denied. His journey is the 
          inevitable collision between his need for truth and a world that has declared 
          truth to be a crime.</p>
        `,
      },
    },
    {
      id: 'c_win_c',
      stepId: 'step-char-chart',
      content: {
        text: `
      <p><strong>TECHNICAL SPECIFICATIONS: Winston Smith</strong></p>
      
      <p><strong>Physical Description:</strong>
      <ul>
        <li><strong>Age:</strong> 39 (Born c. 1945)</li>
        <li><strong>Build:</strong> Small, frail, thin.</li>
        <li><strong>Face:</strong> Naturally sanguine, skin roughened by coarse soap, blunt razor blades, and the cold of the winter.</li>
        <li><strong>Hair:</strong> Very fair.</li>
      </ul></p>
      
      <p><strong>Medical History:</strong>
      <ul>
        <li><strong>Primary Condition:</strong> Varicose ulcer above the right ankle (inflames when stressed).</li>
        <li><strong>General Health:</strong> Poor; plagued by a racking morning cough and a general sense of physical exhaustion.</li>
      </ul></p>
      
      <p><strong>Professional Profile:</strong>
      <ul>
        <li><strong>Department:</strong> Records Department (Minitrue).</li>
        <li><strong>Specialization:</strong> Rectification of historical documents and Newspeak adaptation.</li>
        <li><strong>Security Clearance:</strong> Outer Party.</li>
      </ul></p>
      
      <p><strong>Mannerisms:</strong>
      <ul>
        <li><strong>Voice:</strong> A low, suppressed murmur.</li>
        <li><strong>Habits:</strong> Drinking Victory Gin in one gulp; sitting in the corner of his room to avoid the telescreen's gaze.</li>
      </ul></p>
    `,
      },
    },

    // Julia (Supporting)
    {
      id: 'c_jul_s',
      stepId: 'step-char-summary',
      content: { text: 'Julia: Rebels only from the waist down.' },
    },
    {
      id: 'c_jul_p',
      stepId: 'step-major-char',
      content: {
        text: 'Works on the novel-writing machines. Expert at appearing loyal to the Party.',
      },
    },
    {
      id: 'c_jul_c',
      stepId: 'step-char-chart',
      content: { text: 'Age: 26 | Traits: Practical, sensual, focused on survival.' },
    },

    // O'Brien (Antagonist)
    {
      id: 'c_obr_s',
      stepId: 'step-char-summary',
      content: { text: "O'Brien: The sophisticated face of the Inner Party." },
    },
    {
      id: 'c_obr_p',
      stepId: 'step-major-char',
      content: { text: 'An intellectual who believes power is an end in itself.' },
    },

    // Minor Characters
    {
      id: 'c_par_s',
      stepId: 'step-minor-char',
      content: { text: 'Parsons: The ultimate "unperson" in waiting.' },
    },
    {
      id: 'c_cha_s',
      stepId: 'step-minor-char',
      content: { text: 'Mr. Charrington: The Thought Police in disguise.' },
    },

    // --- STRUCTURE & PLOT TREE ---
    {
      id: 'n_sum',
      stepId: 'step-summary',
      content: {
        text: 'A man tries to rebel by falling in love in a world where love is a crime.',
      },
    },
    {
      id: 'n_story',
      stepId: 'step-storyline',
      content: {
        text: `
          Winston Smith, a disillusioned official in the totalitarian state of Oceania, 
          commits a capital crime by starting a secret diary to record his forbidden 
          thoughts. His rebellion deepens when he begins an illicit love affair with 
          Julia, a pragmatic co-worker, and they eventually seek out a mysterious 
          resistance leader named O'Brien. However, they are betrayed by O'Brien and 
          captured by the Thought Police, leading to Winston's imprisonment in the 
          Ministry of Love. He is subjected to brutal physical and psychological 
          torture, climaxing in the horrors of Room 101 where he finally betrays Julia 
          to save himself. Broken and re-educated, Winston is released back into society, 
          fully stripped of his individuality and truly loving Big Brother.
        `,
      },
    },

    // ACT 1: INCITING INCIDENT
    {
      id: 'a1_syn',
      stepId: 'step-plot-synopsis',
      content: {
        text: `
      <p>Winston Smith, living in the decaying Airstrip One, begins a secret rebellion by 
      purchasing an antique diary. He struggles with the crushing weight of Party 
      surveillance while working at the Ministry of Truth. During a mandatory 'Two Minute Hate,' 
      he makes brief eye contact with a high-ranking official named O'Brien, leading him 
      to believe O'Brien is a fellow dissident. His paranoia grows as he notices a 
      dark-haired girl following him, whom he suspects is a member of the Thought Police. 
      The act ends with Winston realizing he has committed thoughtcrime and that his 
      fate is now sealed.</p>
    `,
      },
    },
    {
      id: 'a1_det',
      stepId: 'step-detailed-synopsis',
      content: {
        text: `
        <p>Winston’s return to Victory Mansions is a gauntlet of sensory decay—the smell of boiled cabbage and old rag mats. 
        He reaches his flat on the seventh floor, his varicose ulcer throbbing. Inside, he discovers the peculiar architecture 
        of his room: a shallow alcove to the right of the telescreen which, by some fluke of design, is out of its field of vision.</p>
        
        <p>This physical blind spot becomes a psychological one. He produces the cream-laid notebook he bought in the 
        slums—a beautiful, archaic object that is itself a crime. The nib pen is scratchy, and his handwriting is 
        unpracticed, but once he begins, the suppression of years breaks. He isn't just writing; he is leaking truth. 
        He realizes with a jolt of terror that he has written 'DOWN WITH BIG BROTHER' over and over again. 
        Whether he writes it or not makes no difference now—the thoughtcrime is complete.</p>
        
        <p>He is interrupted by a knock at the door, certain the Thought Police have arrived, but it is only Mrs. Parsons, 
        looking for help with a blocked sink, highlighting the mundane misery that he is now fundamentally separated from.</p>
      `,
      },
    },
    {
      id: 'a1_sc1',
      stepId: 'step-scene-overview',
      content: {
        text: `
          <p><strong>POV:</strong> Winston Smith<br>
          <strong>Setting:</strong> Winston's cramped flat, Victory Mansions.</p>
          
          <p><strong>Action:</strong> Winston retrieves the forbidden cream-laid book from its hiding place. 
          The scene focuses on his physical state—the coughing fit, the throb of his ulcer—contrasted 
          with the tactile beauty of the paper. He struggles with the physical act of writing, a 
          skill he hasn't used in years. He finally breaks through his internal censor, scribbling 
          uncontrollably until the page is covered in "DOWN WITH BIG BROTHER."</p>
          
          <p><strong>Outcome:</strong> Winston realizes he is now a "dead man" and the psychological 
          threshold has been crossed. There is no turning back.</p>
        `,
      },
    },
    {
      id: 'a1_sc2',
      stepId: 'step-scene-overview',
      content: {
        text: `
          <p><strong>POV:</strong> Winston Smith<br>
          <strong>Setting:</strong> The Records Department, Ministry of Truth. Crowded, flickering telescreens.</p>
          
          <p><strong>Action:</strong> The Two Minutes Hate begins. Winston is surrounded by screaming 
          colleagues, but his focus is split between two people: the dark-haired girl from the 
          Fiction Department, whom he intensely fears and desires, and O'Brien, a member of 
          the Inner Party. As the image of Emmanuel Goldstein appears and the frenzy peaks, 
          Winston catches O'Brien's eye for a fraction of a second. In that moment, he is 
          convinced he sees a shared understanding—a flicker of rebellion that matches his own.</p>
          
          <p><strong>Outcome:</strong> Winston leaves the Hate with a dangerous new hope. He has 
          identified a potential ally and a potential enemy, setting the trajectory for the rest 
          of the story.</p>
        `,
      },
    },
    {
      id: 'a1_ch1',
      stepId: 'step-chapter',
      content: {
        text: `
      <h1>Chapter One</h1>
      <p>It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, ...`,
      },
    },

    // ACT 2: THE REBELLION (Parallel Paths)
    {
      id: 'a2_syn',
      stepId: 'step-plot-synopsis',
      content: {
        text: `
      <p>Winston and Julia begin a series of illicit meetings, first in the countryside and 
      then in a rented room above Mr. Charrington's antique shop, finding a temporary 
      sanctuary for their forbidden love. As their relationship deepens, they are 
      eventually contacted by O'Brien, who invites them to his luxurious Inner Party 
      apartment and initiates them into "The Brotherhood," a secret organization 
      dedicated to overthrowing the Party. Winston receives "The Book," a revolutionary 
      treatise by Emmanuel Goldstein, which he begins to read with a sense of profound 
      discovery. Their sense of safety grows alongside their rebellion, leading them to 
      believe they can maintain their private world indefinitely. However, the act ends 
      abruptly when the Thought Police smash through the window of their secret room, 
      revealing that Mr. Charrington was a hidden agent of the Thought Police all along.</p>
    `,
      },
    },
    {
      id: 'a2_det1',
      stepId: 'step-detailed-synopsis',
      content: {
        text: `
      <p>Winston’s journey to the countryside is a masterclass in survival through mundanity. 
      He takes a train from Paddington, watching the landscape shift from the bombed-out 
      shells of London to a greener, more ancient England. Every person on the train is 
      a potential threat; every glance must be neutral. He walks along the edge of a 
      field, following the precise directions Julia gave him in a whispered moment at the 
      Ministry, his heart hammering against his ribs in the quiet air.</p>

      <p>The clearing they finally meet in is a slice of the 'Golden Country' he has seen 
      in his dreams. The air is thick with the scent of bluebells and the ground is soft 
      with moss. Here, the absence of the telescreen is a physical weight lifted from 
      his chest, though the fear of hidden microphones remains—a reminder that the 
      Party’s reach is auditory even when it isn't visual. They don't speak at first; 
      the silence is too precious, broken only by the sudden, crystalline song of a 
      thrush in the branches above them.</p>

      <p>When Julia finally arrives, she is transformed. The red sash of the Junior 
      Anti-Sex League is discarded, and her pragmatic, earthy defiance is on full display. 
      This isn't a romantic meeting in the traditional sense; it is a tactical strike 
      against the state. The simple act of touching her hand is the most revolutionary 
      thing he has ever done. In this clearing, they begin to construct a private reality 
      that the Party cannot observe, a world built on instinct and physical presence 
      rather than ideology.</p>
    `,
      },
    },
    {
      id: 'a2_det2',
      stepId: 'step-detailed-synopsis',
      content: { text: "Joining the Brotherhood: O'Brien brings the book." },
    },
    {
      id: 'a2_sc1',
      stepId: 'step-scene-overview',
      content: { text: 'Scene 2.1: The Bluebell Woods.' },
    },
    {
      id: 'a2_sc2',
      stepId: 'step-scene-overview',
      content: { text: "Scene 2.2: O'Brien's Apartment." },
    },
    { id: 'a2_ch10', stepId: 'step-chapter', content: { text: 'Chapter 10: The Golden Country.' } },
    {
      id: 'a2_ch15',
      stepId: 'step-chapter',
      content: { text: 'Chapter 15: The wine and the pledge.' },
    },

    // ACT 3: THE RESOLUTION
    {
      id: 'a3_syn',
      stepId: 'step-plot-synopsis',
      content: { text: 'They are captured and Winston is systematicially broken.' },
    },
    {
      id: 'a3_det',
      stepId: 'step-detailed-synopsis',
      content: { text: 'Room 101: The final betrayal.' },
    },
    {
      id: 'a3_sc1',
      stepId: 'step-scene-overview',
      content: { text: 'Scene 3.1: The windowless cell.' },
    },
    { id: 'a3_sc2', stepId: 'step-scene-overview', content: { text: 'Scene 3.2: The Rats.' } },
    { id: 'a3_ch24', stepId: 'step-chapter', content: { text: 'Chapter 24: "Do it to Julia!"' } },
  ],
  edges: [
    { id: 'e_s1', source: 'n_sum', target: 'n_story' },

    // Character Branching
    { id: 'e_c1', source: 'n_story', target: 'c_win_s' },
    { id: 'e_c2', source: 'n_story', target: 'c_jul_s' },
    { id: 'e_c3', source: 'n_story', target: 'c_obr_s' },
    { id: 'e_c4', source: 'c_win_s', target: 'c_win_p' },
    { id: 'e_c5', source: 'c_win_p', target: 'c_win_c' },
    { id: 'e_c6', source: 'c_jul_s', target: 'c_jul_p' },
    { id: 'e_c7', source: 'c_jul_p', target: 'c_jul_c' },
    { id: 'e_c8', source: 'c_obr_s', target: 'c_obr_p' },
    { id: 'e_c9', source: 'n_story', target: 'c_par_s' },
    { id: 'e_c10', source: 'n_story', target: 'c_cha_s' },

    // Plot Branching
    { id: 'e_p1', source: 'n_story', target: 'a1_syn' },
    { id: 'e_p2', source: 'n_story', target: 'a2_syn' },
    { id: 'e_p3', source: 'n_story', target: 'a3_syn' },

    // Act 1 Detail
    { id: 'e_a1_1', source: 'a1_syn', target: 'a1_det' },
    { id: 'e_a1_2', source: 'a1_det', target: 'a1_sc1' },
    { id: 'e_a1_3', source: 'a1_det', target: 'a1_sc2' },
    { id: 'e_a1_4', source: 'a1_sc1', target: 'a1_ch1' },

    // Act 2 Detail (Parallel)
    { id: 'e_a2_1', source: 'a2_syn', target: 'a2_det1' },
    { id: 'e_a2_2', source: 'a2_syn', target: 'a2_det2' },
    { id: 'e_a2_3', source: 'a2_det1', target: 'a2_sc1' },
    { id: 'e_a2_4', source: 'a2_det2', target: 'a2_sc2' },
    { id: 'e_a2_5', source: 'a2_sc1', target: 'a2_ch10' },
    { id: 'e_a2_6', source: 'a2_sc2', target: 'a2_ch15' },

    // Act 3 Detail
    { id: 'e_a3_1', source: 'a3_syn', target: 'a3_det' },
    { id: 'e_a3_2', source: 'a3_det', target: 'a3_sc1' },
    { id: 'e_a3_3', source: 'a3_det', target: 'a3_sc2' },
    { id: 'e_a3_4', source: 'a3_sc2', target: 'a3_ch24' },
  ],
}
