import vm from 'node:vm';

/**
 * Runs user-submitted JavaScript code against form data safely.
 * @param {string} userCode - The JS string written by the user/admin.
 * @param {object} formData - The answers submitted by the client.
 * @returns {object} - The mutated or processed data.
 */
function runUserScript(userCode:any, formData:any) {
    // If there is no custom script written for this form, return data as-is
    if (!userCode || userCode.trim() === "") {
        return formData;
    }

    // Define what variables the user's script is allowed to touch
    const contextObject = {
        data: { ...formData }, // Pass a copy of the submitted data
    };

    // Isolate the context
    const context = vm.createContext(contextObject);

    try {
        // Enforce strict timeout (50ms) to stop infinite loops dead in their tracks
        const script = new vm.Script(userCode);
        script.runInContext(context, { timeout: 50 });

        // Return the modified data object back to our route
        return context.data;
    } catch (error:any) {
        throw new Error(`JS Runner Error: ${error.message}`);
    }
}

export default runUserScript