import { Observable } from 'rxjs'
import { from } from 'rxjs/internal/observable/from'
import { childUseCase } from './childUseCase'

describe(`${childUseCase.name}`, () => {
    it(`should convert observable to async iterator`, async () => {
        const source = [1, 2, 3, 4]
        const useCase = childUseCase(from(source))
        const result = []
        for await (const value of useCase) {
            result.push(value)
        }
        expect(result).toEqual(source)
    })
})
