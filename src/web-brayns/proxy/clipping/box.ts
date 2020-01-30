import ClippingService from '../../service/clipping'
import Geom from '../../geometry'
import Scene from '../../scene'
import { IVector, IQuaternion } from '../../types'

interface IBoxProps {
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    latitude: number,
    longitude: number,
    tilt: number
}

interface IHighLevelPlane {
    id: number,
    point: IVector,
    normal: IVector
}

export default class Box {
    // If not activated, no clipping plane is recorder into Brayns.
    private _activated = false
    private _planes: IHighLevelPlane[] = []
    private props: IBoxProps

    constructor(props: IBoxProps) {
        this.props = {
            x: 0, y: 0, z: 0,
            width: 32, height: 24, depth: 4,
            latitude: 0, longitude: 0, tilt: 0,
            ...props
        }
    }

    async update(activated: boolean, params: Partial<IBoxProps> = {}) {
        try {
            this.props = {
                ...this.props,
                ...params
            }

            await this.removeAllPlans()
            this._activated = activated
            if (activated) {
                this.computePlanes()
                for (const plane of this._planes) {
                    console.log("addPlane", plane.point, plane.normal)
                    const id = await ClippingService.addPlane(plane.point, plane.normal)
                    plane.id = id
                }
            }
        }
        catch (ex) {
            throw ex
        }
    }

    private async removeAllPlans() {
        const planeIds = await Scene.Api.getClipPlanes()
        const ids = planeIds
            .map(plane => plane ? plane.id : -1)
            .filter(id => id > -1)
        if (ids.length > 0) {
            await ClippingService.removePlanes(ids)
        }
    }

    get activated() { return this._activated }

    private computePlanes() {
        const { latitude, longitude, tilt } = this.props
        const orientation: IQuaternion = Geom.makeQuaternionFromLatLngTilt(
            latitude, longitude, tilt
        )

        const { x, y, z } = this.props
        const center: IVector = [x, y, z]

        const { width, height, depth } = this.props;

        const rightPoint: IVector = [width / 2, 0, 0]
        const leftPoint: IVector = [-width / 2, 0, 0]
        const topPoint: IVector = [0, height / 2, 0]
        const bottomPoint: IVector = [0, -height / 2, 0]
        const frontPoint: IVector = [0, 0, depth / 2]
        const backPoint: IVector = [0, 0, -depth / 2]

        const rightNormal: IVector = Geom.rotateWithQuaternion(rightPoint, orientation)
        const leftNormal: IVector = Geom.rotateWithQuaternion(leftPoint, orientation)
        const topNormal: IVector = Geom.rotateWithQuaternion(topPoint, orientation)
        const bottomNormal: IVector = Geom.rotateWithQuaternion(bottomPoint, orientation)
        const frontNormal: IVector = Geom.rotateWithQuaternion(frontPoint, orientation)
        const backNormal: IVector = Geom.rotateWithQuaternion(backPoint, orientation)

        this._planes = [
            {
                id: -1,
                point: Geom.addVectors(center, rightNormal),
                normal: Geom.normalize(rightNormal)
            },
            {
                id: -1,
                point: Geom.addVectors(center, leftNormal),
                normal: Geom.normalize(leftNormal)
            },
            {
                id: -1,
                point: Geom.addVectors(center, topNormal),
                normal: Geom.normalize(topNormal)
            },
            {
                id: -1,
                point: Geom.addVectors(center, bottomNormal),
                normal: Geom.normalize(bottomNormal)
            },
            {
                id: -1,
                point: Geom.addVectors(center, frontNormal),
                normal: Geom.normalize(frontNormal)
            },
            {
                id: -1,
                point: Geom.addVectors(center, backNormal),
                normal: Geom.normalize(backNormal)
            }
        ]
    }
}
