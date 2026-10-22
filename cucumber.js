//CUCUMBER CONFIG: cucumber-js automatically reads this file from the project root, so we don't need to type
//long flags every time - `npx cucumber-js` alone is enough. This is the "default" profile.
module.exports = {
    default: {
        //Same as passing `--exit` on the command line: force the process to end once the run is finished,
        //so the terminal doesn't stay hanging with Cucumber still "in executable mode".
        forceExit: true,
        //Which step definition file(s) to load. 119 (module variables), 120 (World constructor), 121 (Hooks) and
        //122 (Tags + error validation) are lesson-by-lesson versions of the SAME steps; loading more than one gives
        //"Multiple step definitions match", and loading a fully commented-out one gives "Undefined" steps.
        //So we load ONLY the newest version. When you move to the next lesson's file, change this path.
        //Hooks live in features/support/ and must be listed too - otherwise Before/After never run and
        //`this.poManager` is undefined in the steps.
        //(122 contains the steps for BOTH features, so both feature files run with this one steps file.)
        require: [
            'features/support/122_tagged-hooks.js',
            'features/step_definitions/122_cucumber-tags.js',
        ],
        //NOTE: the lecture adds `publishQuiet: true` here to hide the "Share your test results" (publish) banner.
        //Our installed Cucumber (12.x) no longer prints that banner and no longer has this option, so it is not needed.
    },
};
