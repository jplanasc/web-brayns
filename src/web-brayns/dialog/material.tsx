import React from "react"

import { IMaterial } from '../types'
import Dialog from '../../tfw/factory/dialog'
import Material from '../view/material'

export default {
    async show(): Promise<IMaterial | null> {
        let result: IMaterial | null = null;
        const answer = await Dialog.confirm(
            "Apply Material",
            <Material onSelect={(material: IMaterial) => result = material}/>);
        if (!answer) return null;
        return result;
    }
}
