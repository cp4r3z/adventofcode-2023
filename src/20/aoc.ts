// type OutputData = {
//     module: Module;
//     pulseBit: bigint;
//     nPulseBit: bigint;
// }

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

        return module;
    });

    const lines = input.split('\n');
    const modules: Module[] = lines.map(toModule);

    // Dummy output module for testing
    const dummy = new Broadcast('output');
    tempMapModules.set('output', dummy);

    const button = new Broadcast('button');
    button.linkToModule(broadcaster);

    modules.forEach((module: Module) => {
        const outStrings = tempMapOuts.get(module.id) || [];
        outStrings.forEach(outId => {
            const outModule = tempMapModules.get(outId);
            if (!outModule) {
                debugger;
            }
            module.linkToModule(outModule);
        });
    });

    return { button, broadcaster, modules };
};

type State = {
    // TODO: Does the registry need to be a bigint?

    // bit position for a state
    // 1 << 0, // 1
    // 1 << 1, // 2
    // 1 << 2, // 4   
    registry: bigint; // Store everything stateful
    lastBit: bigint; // The highest / last bit of registry

    // Can this be moved elsewhere?
    sentLow: number;
    sentHigh: number;
}

type Pulse = {
    sender: Module;
    receiver: Module;
    isHigh: boolean;
}

export const part1 = async (input: string): Promise<number | string> => {
    const { button, broadcaster, modules } = parse(input);

    const state: State = {
        registry: 0n,
        lastBit: 0n,
        sentLow: 0,
        sentHigh: 0
    }

    modules.forEach(module => {
        module.initRegisters(state);
    })

    const buttonPress: Pulse = {
        sender: button,
        receiver: broadcaster,
        isHigh: false
    };

    // Press button 1000 times?
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
    return 0;
};
