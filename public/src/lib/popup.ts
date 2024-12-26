import { $, _$ } from "./dom.js";

// type declarations
type container = ReturnType<typeof $>
type Init = ReturnType<typeof $>

const animationTiming = 200;

// container declaration
const container = $('.popups');
container.setProperty("animationDuration", animationTiming + 'ms').display(false);

container.on("click", e => {
    if (e.target === container.e) {
        hideWindows();
        hideParent();
    }
})

// hide windows
_$('.popups > div').forEach(e => {
    e.display(false).setProperty("animationDuration", animationTiming + 'ms');
});

let activeWindow: Init | null;

$('.popups .alert button').on("click", () => {
    hideWindows();
    hideParent();
});

// for test only
/*document.addEventListener("keydown", (e) => {
    if (e.key === 's') {
        e.preventDefault();
        displayAlert("Hi mom");
    }
});*/

function hideWindows () {
    return new Promise<void>((res) => {
        if (activeWindow) {
            activeWindow.setProperty("animationName", "pop")
                        .setProperty("animationDirection", "normal");

            setTimeout((activeWindow: Init) => {
                activeWindow.display(false).removeProperty("animationName");
                res();
            }, (animationTiming - 10), activeWindow);

            activeWindow = null;
        } else {
            res();
        }
    });
}

function hideParent () {
    return new Promise<void>((res) => {
        container.removeProperty("animationName")
                 .setProperty("animationDirection", "normal")
                 .setProperty("animationName", "opop");

        setTimeout((container: Init) => {
            container.display(false).removeProperty("animationName");
            res();
        }, (animationTiming - 10), container);
    });
}

function showParent() {
    return new Promise<void>((res) => {
        container.display('flex')
                 .setProperty("animationDirection", "reverse")
                 .setProperty("animationName", "opop");

        setTimeout((container: Init) => {
            container.removeProperty("animationName");
            res();
        }, (animationTiming - 10), container);
    })
}

export function displayWindow (className: string) {
    return new Promise<Init>(async ( res ) => {
        const window = $(`.popups ${className}`);

        await hideWindows();
        
        if (container.Display === 'none' || container.Display === false) {
            showParent();
        }

        activeWindow = window;

        window.display('flex')
              .setProperty("animationDirection", "reverse")
              .setProperty("animationName", "pop");

        setTimeout((window: Init) => {
            window.removeProperty("animationName");
            res(window);
        }, (animationTiming - 10), window);
    });
}

export function displayAlert (message: string, cb?: () => void) {
    displayWindow(".alert");
    $('.popups .alert h1').text(message).setProperty("fontSize", message.length > 15? "24px": "32px");
    if (cb) {
        container.once("click", () => {
            cb();
        });
    }
}