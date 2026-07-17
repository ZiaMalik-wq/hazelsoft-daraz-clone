/**
 * Global Store - Manages application-wide state.
 */
window.DarazStore = (function () {
    let state = {
        currentUser: null,
        cart: [],
        activeProduct: null,
        config: {
            baseUrl: 'http://localhost:5000'
        }
    };

    function setState(newState) {
        state = { ...state, ...newState };
        $(document).trigger('daraz:state-changed', [state]);
    }

    function getState() {
        return { ...state };
    }

    return {
        setState,
        getState
    };
})();
