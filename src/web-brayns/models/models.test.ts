import Models from './models'
import { IBounds, IModel, IBraynsModel } from './types'

describe("[web-brayns/models/models]", () => {
    describe("getModelsBounds", () => {
        const check = (boundsList: IBounds[], expected: IBounds) => {
            const result = Models.getModelsBounds(
                boundsList.map((bounds: IBounds) => ({
                    brayns: { bounds }
                } as IModel))
            )
            expect(result).toEqual(expected)
        }

        it('should work with one model', () => {
            const bounds: IBounds = {
                min: [-Math.random(), -Math.random(), -Math.random()],
                max: [Math.random(), Math.random(), Math.random()]
            }
            check([bounds], bounds)
        })

        it('should work with two models', () => {
            const bounds1: IBounds = {
                min: [0, 0, 0],
                max: [1, 2, 3]
            }
            const bounds2: IBounds = {
                min: [-1, 0, 1],
                max: [0, 4, 2]
            }
            const bounds: IBounds = {
                min: [-1, 0, 0],
                max: [1, 4, 3]
            }
            check([bounds1, bounds2], bounds)
        })

        it('should ignore invalid bounds', () => {
            const bounds1: IBounds = {
                min: [0, 0, 0],
                max: [1, 2, 3]
            }
            const bounds2: IBounds = {
                min: [-1, 0, 1],
                max: [0, 4, 2]
            }
            const bounds3: IBounds = {
                min: [1, 0, 1],
                max: [0, 4, 2]
            }
            const bounds: IBounds = {
                min: [-1, 0, 0],
                max: [1, 4, 3]
            }
            check([bounds1, bounds2, bounds3], bounds)
        })
    })
})
