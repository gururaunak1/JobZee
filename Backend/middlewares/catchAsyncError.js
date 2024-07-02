// this will handle the all the ASYNC error that we have have forgot to handle, good practice to do this.
// this will recive a function in it.
export const catchAsyncErrors = (theFunction) => {
    return (req, res, next) => {
        Promise.resolve(theFunction(req, res, next)).catch(next);
    };
};