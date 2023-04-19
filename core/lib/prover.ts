import {pathJoin} from "./utils";
import {any} from "hardhat/internal/core/params/argumentTypes";
import window = Mocha.reporters.Base.window;

const main_update_state_js_wc = require('../../circuits/main_update_state_js/witness_calculator');
const main_withdraw_js_wc = require('../../circuits/main_withdraw_js/witness_calculator');

const fs = require("fs");
const snarkjs = require("snarkjs");

export class Prover {

    static async updateState(circuitPath: string, input: any) {
        if (typeof window == 'object') {
            return await Prover.updateStateBS('', '', any)
        } else {
            return await Prover.updateStateNode(circuitPath, input)
        }
    }

    static async updateStateNode(circuitPath: string, input: any) {
        let wasm = pathJoin([circuitPath, "main_update_state_js", "main_update_state.wasm"]);
        let zkey = pathJoin([circuitPath, "circuit_final.zkey.16"]);
        const wc = require(`${circuitPath}/main_update_state_js/witness_calculator`);
        const buffer = fs.readFileSync(wasm);
        const witnessCalculator = await wc(buffer);

        // console.log("prover input", input);
        const witnessBuffer = await witnessCalculator.calculateWTNSBin(
            input,
            0
        );

        const {proof, publicSignals} = await snarkjs.groth16.prove(zkey, witnessBuffer);
        // console.log("proof", proof, publicSignals)
        const proofAndPublicSignals = {
            proof,
            publicSignals
        };
        return proofAndPublicSignals;
    }

    static async updateStateBS(wasmPath: any, zkeyPath: any, input: any) {
        return Prover.buildProofAndPublicSignals(main_update_state_js_wc, wasmPath, zkeyPath, input)
    }

    static async verifyState(circuitPath: string, proofAndPublicSignals: any) {
        if (typeof window == 'object') {
            return await Prover.verifyStateBS('', proofAndPublicSignals)
        } else {
            return await Prover.verifyStateNode(circuitPath, proofAndPublicSignals)
        }
    }

    static async verifyStateNode(circuitPath: string, proofAndPublicSignals: any) {
        const proof = proofAndPublicSignals.proof;
        const publicSignals = proofAndPublicSignals.publicSignals;

        let zkey = pathJoin([circuitPath, "circuit_final.zkey.16"]);
        const vKey = await snarkjs.zKey.exportVerificationKey(zkey);
        const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        return res;
    }

    static async verifyStateBS(circuitPath: string, proofAndPublicSignals: any) {
        return await Prover.verify(circuitPath, proofAndPublicSignals)
    }

    static async withdraw(circuitPath: string, input: any) {
        if (typeof window == 'object') {
            return await Prover.withdrawBS('', '', input)
        } else {
            return await Prover.withdrawNode(circuitPath, input)
        }
    }

    static async withdrawNode(circuitPath: string, input: any) {
        let wasm = pathJoin([circuitPath, "main_withdraw_js", "main_withdraw.wasm"]);
        let zkey = pathJoin([circuitPath, "circuit_final.zkey.14"]);
        const wc = require(`${circuitPath}/main_withdraw_js/witness_calculator`);
        const buffer = fs.readFileSync(wasm);
        const witnessCalculator = await wc(buffer);

        // console.log("withdraw prover input", input);
        const witnessBuffer = await witnessCalculator.calculateWTNSBin(
            input,
            0
        );

        const {proof, publicSignals} = await snarkjs.groth16.prove(zkey, witnessBuffer);
        // console.log("proof", proof, publicSignals)
        const proofAndPublicSignals = {
            proof,
            publicSignals
        };
        return proofAndPublicSignals;
    }

    static async withdrawBS(wasmPath: any, zkeyPath: any, input: any) {
        return Prover.buildProofAndPublicSignals(main_withdraw_js_wc, wasmPath, zkeyPath, input)
    }


    static async verifyWithrawal(circuitPath: string, proofAndPublicSignals: any) {
        if (typeof window == 'object') {
            return await Prover.verifyWithrawalBS('', proofAndPublicSignals)
        } else {
            return await Prover.verifyWithrawalNode(circuitPath, proofAndPublicSignals)
        }
    }


    static async verifyWithrawalNode(circuitPath: string, proofAndPublicSignals: any) {
        const proof = proofAndPublicSignals.proof;
        const publicSignals = proofAndPublicSignals.publicSignals;

        let zkey = pathJoin([circuitPath, "circuit_final.zkey.14"]);
        const vKey = await snarkjs.zKey.exportVerificationKey(zkey);
        const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        return res;
    }

    static async verifyWithrawalBS(circuitPath: string, proofAndPublicSignals: any) {
        return await Prover.verify(circuitPath, proofAndPublicSignals)
    }

    static serialize(proofAndPublicSignals: any) {
        return JSON.stringify(proofAndPublicSignals)
    }

    static async verify(zkeyPath: string, proofAndPublicSignals: any) {
        const proof = proofAndPublicSignals.proof;
        const publicSignals = proofAndPublicSignals.publicSignals;
        const zkeyBuffer = await Prover.fetch(zkeyPath)
        const vKey = await snarkjs.zKey.exportVerificationKey(zkeyBuffer);
        const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        return res;
    }

    static async buildProofAndPublicSignals(wc: any, wasmPath: any, zkeyPath: any, input: any) {
        return await Prover.doBuildProofAndPublicSignals(wc, Prover.fetch(wasmPath), Prover.fetch(zkeyPath), input)
    }

    static async doBuildProofAndPublicSignals(wc: any, wasmBuffer: any, zkeyBuffer: any, input: any) {
        const witnessCalculator = await wc(wasmBuffer);

        // console.log("prover input", input);
        const witnessBuffer = await witnessCalculator.calculateWTNSBin(
            input,
            0
        );

        const {proof, publicSignals} = await snarkjs.groth16.prove(zkeyBuffer, witnessBuffer);
        // console.log("proof", proof, publicSignals)
        const proofAndPublicSignals = {
            proof,
            publicSignals
        };
        return proofAndPublicSignals;
    }


    static async fetch(url: string) {
        if (typeof window == 'object' && typeof WebAssembly == 'object') {
            const response = await window.fetch(url)
            const buffer = await response.arrayBuffer()
            return buffer
        }
    }


}
