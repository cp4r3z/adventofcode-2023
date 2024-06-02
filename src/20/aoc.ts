import * as Arithmetic from '../common/math/arithmetic';

type State = {

    registry: bigint; // Store everything stateful
    lastBit: bigint; // The highest / last bit of registry

    // bit position for a state
    // 1 << 0, // 1
    // 1 << 1, // 2
    // 1 << 2, // 4   

    sentLow: number;
    sentHigh: number;
}

type Pulse = {
    sender: Module;
    receiver: Module;
    isHigh: boolean;
}

abstract class Module {

    protected inputs: Module[] = []; // List of modules that sent a pulse
    protected outputs: Module[] = []; // List of modules to receive pulse

    constructor(public id: string) { }

    protected sendPulses(state: State, isHigh: boolean, pulseQueue: Pulse[]) {
        this.outputs.forEach(output => {
            const nextPulse: Pulse = {
                sender: this,
                receiver: output,
                isHigh
            };
            pulseQueue.push(nextPulse);
            isHigh ? state.sentHigh++ : state.sentLow++;
        });
    }

    public linkToModule(output: Module) {
        this.outputs.push(output);
        output.inputs.push(this);
    }

    // add any registry bits necessary to preserve the state between button presses
    abstract initRegisters(state: State): void;

    // pulse should handle the pulse from the sender and add any subsequent pulses to the queue
    abstract processPulse(state: State, pulse: Pulse, pulseQueue: Pulse[]): void;
}

class Broadcast extends Module {
    initRegisters(state: State) {
        // Broadcast Modules are not stateful
    }

    processPulse(state: State, pulse: Pulse, pulseQueue: Pulse[]) {
        const isHigh = pulse.isHigh;
        super.sendPulses(state, isHigh, pulseQueue);
    }
}

class FlipFlop extends Module {
    private _onBit: bigint = 0n; // Don't use directly
    private _register: bigint;

    // Incorporate these methods into a new state class
    _turnOn(state: State) {
        state.registry |= this._register;
    }

    _turnOff(state: State) {
        state.registry &= ~this._register;
    }

    _isOn(state: State) {
        return (state.registry & this._register) > 0;
    }

    initRegisters(state: State): void {
        this._onBit = state.lastBit++;
        this._register = 1n << this._onBit;
    }

    processPulse(state: State, pulse: Pulse, pulseQueue: Pulse[]) {
        // If a flip-flop module receives a high pulse, it is ignored and nothing happens. 
        if (pulse.isHigh) {
            return;
        }

        let isOn = this._isOn(state);
        isOn ? this._turnOff(state) : this._turnOn(state);

        const isHigh = !isOn;
        super.sendPulses(state, isHigh, pulseQueue);
    }
}

class Conjunction extends Module {
    private _registers: Map<Module, bigint> = new Map();

    _updateMemory(state: State, pulse: Pulse) {
        const input = pulse.sender;
        const register: bigint = this._registers.get(input);
        if (!register) {
            debugger; // remove!
        }

        if (pulse.isHigh) {
            state.registry |= register;
        } else {
            state.registry &= ~register;
        }
    }

    _areAllHigh(state: State) {
        for (const input of this.inputs) {
            const isLow = (state.registry & this._registers.get(input)) === 0n;
            if (isLow) {
                return false;
            }
        }
        return true;
    }

    initRegisters(state: State): void {
        // we need storage bits for all inputs
        this.inputs.forEach(input => {
            const register = 1n << state.lastBit++;
            this._registers.set(input, register);
        });
    }

    processPulse(state: State, pulse: Pulse, pulseQueue: Pulse[]) {

        // When a pulse is received, the conjunction module first updates its memory for that input. 
        this._updateMemory(state, pulse);

        // Then, if it remembers high pulses for all inputs, it sends a low pulse; 
        // otherwise, it sends a high pulse.
        const allHigh = this._areAllHigh(state);

        const isHigh = !allHigh;
        super.sendPulses(state, isHigh, pulseQueue);
    }
}

const parse = (input: string) => {

    const reInsOuts = /(.+) -> (.+)/;

    const tempMapOuts = new Map<string, string[]>();
    const tempMapModules = new Map<string, Module>();

    let broadcaster;

    let ft: Module; // For Part 2

    const toModule = ((s: string, i: number) => {
        const matches = s.match(reInsOuts);
        const inString = matches[1];
        const typeString = inString.slice(0, 1);
        let module;
        if (typeString === '%') {
            module = new FlipFlop(inString.slice(1));
        } else if (typeString === '&') {
            module = new Conjunction(inString.slice(1));
        } else if (typeString === 'b') {
            module = new Broadcast(inString);
            broadcaster = module;
        } else {
            throw new Error();
        }
        tempMapModules.set(module.id, module);

        const outIds = matches[2].split(', ');
        tempMapOuts.set(module.id, outIds);

        if (module.id === 'ft') {
            ft = module;
        }

        return module;
    });

    const lines = input.split('\n');
    const modules: Module[] = lines.map(toModule);

    const button = new Broadcast('button');
    button.linkToModule(broadcaster);

    let rx: Module;

    modules.forEach((module: Module) => {
        const outStrings = tempMapOuts.get(module.id) || [];
        outStrings.forEach(outId => {
            let outModule = tempMapModules.get(outId);
            if (!outModule) {
                // Create a module with no outputs
                outModule = new Broadcast(outId);
                if (outModule.id === 'rx') {
                    rx = outModule;
                }
            }
            module.linkToModule(outModule);
        });
    });

    const state: State = {
        registry: 0n,
        lastBit: 0n,
        sentLow: 0,
        sentHigh: 0
    }

    modules.forEach(module => {
        module.initRegisters(state);
    });

    return { state, button, broadcaster, rx, ft };
};

export const part1 = async (input: string): Promise<number | string> => {
    const { state, button, broadcaster } = parse(input);

    const buttonPress: Pulse = {
        sender: button,
        receiver: broadcaster,
        isHigh: false
    };

    // 1000 Button Presses
    for (let i = 1; i <= 1000; i++) {
        const pulseQueue: Pulse[] = [buttonPress];
        state.sentLow++;
        while (pulseQueue.length > 0) {
            const pulse = pulseQueue.shift();
            // console.log(`${pulse.sender.id} -${pulse.isHigh ? "high" : "low"}-> ${pulse.receiver.id}`);
            pulse.receiver.processPulse(state, pulse, pulseQueue);
        }
    }

    return state.sentLow * state.sentHigh;
};

export const part2 = async (input: string): Promise<number | string> => {
    const { state, button, broadcaster, rx, ft } = parse(input);

    const buttonPress: Pulse = {
        sender: button,
        receiver: broadcaster,
        isHigh: false
    };

    // Store the frequency at which ft's inputs are sent high pulses
    // Note: We know (from analysis) that the frequencies are regular and occur sequentially
    const ftHigh: number[] = [];

    let buttonPresses = 0;
    let rxPressed = false;
    while (!rxPressed) {

        const pulseQueue: Pulse[] = [buttonPress];
        buttonPresses++;

        state.sentLow++;
        while (pulseQueue.length > 0) {
            const pulse = pulseQueue.shift();
            if (pulse.receiver === rx && !pulse.isHigh) {
                // In theory, this would work if we let the computer run.
                rxPressed = true;
                break;
            }

            // Instead, we look at rx's input ft, which is a Conjunction
            // We record the high pulses

            if (pulse.receiver === ft && pulse.isHigh) {

                // Debugging
                {
                    let countStr = buttonPresses.toString();
                    while (countStr.length < 5) {
                        countStr = "0" + countStr;
                    }
                    console.log(`${countStr} | ${pulse.sender.id} -${pulse.isHigh ? "high" : "low"}-> ${pulse.receiver.id}`);
                }
                ftHigh.push(buttonPresses);
            }
            pulse.receiver.processPulse(state, pulse, pulseQueue);
        }

        if (ftHigh.length === 4) {
            // Similar to the cycle solution in Day 08
            buttonPresses = ftHigh.reduce(Arithmetic.LCM, 1);
            rxPressed = true;
        }
    }

    return buttonPresses;
};
