import ClippingService from '../../service/clipping'
import Geom from '../../geometry'
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

    async update(params: Partial<IBoxProps>) {
        this.props = {
            ...this.props,
            ...params
        }
        if (this._activated) {
            for (const plane of this._planes) {
                await ClippingService.updatePlane(plane.id, plane.point, plane.normal)
            }
        }
    }

    get activated() { return this._activated }
    async setActivated(activated: boolean) {
        if (activated === this._activated) return
        this._activated = activated
        console.info("activated=", activated);
        if (activated) {
            this.computePlanes()
            for (const plane of this._planes) {
                const id = await ClippingService.addPlane(plane.point, plane.normal)
                plane.id = id
            }
        } else {
            // Remove all planes
            const ids = this._planes.map(plane => plane.id)
            if (ids.length > 0) {
                await ClippingService.removePlanes(ids)
            }
        }
    }

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
