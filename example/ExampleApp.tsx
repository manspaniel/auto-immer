import * as React from "react"
import styled from "styled-components"
import { useAuto } from "./useAuto"

const defaultState = {
  title: "Cool",
  meta: {
    nums: [1, 2, 3]
  }
}

export function ExampleApp() {
  const [patches, setPatches] = React.useState([])
  const [data, propose] = useAuto(defaultState, newPatches => [
    setPatches([...patches, ...newPatches])
  ])

  return (
    <Wrapper>
      <Form>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={data.title}
            onChange={e => {
              data.title = e.target.value
            }}
          />
        </div>
        <div>
          {data.meta.nums.map((number, k) => (
            <div key={k}>
              <input
                type="number"
                value={number}
                onChange={e => (data.meta.nums[k] = Number(e.target.value))}
              />
              <button onClick={e => data.meta.nums.splice(k, 1)}>remove</button>
            </div>
          ))}
          <button onClick={e => (data.meta.nums = [...data.meta.nums, 0])}>
            Add item
          </button>
          <button onClick={e => data.meta.nums.sort((a, b) => a - b)}>
            Sort
          </button>
        </div>
      </Form>
      <Info>
        <InfoItem>
          <h4>Data is:</h4>
          <pre>{JSON.stringify(data, null, "  ")}</pre>
        </InfoItem>
        <InfoItem>
          <h4>Patches are</h4>
          <pre>{JSON.stringify(patches, null, "  ")}</pre>
        </InfoItem>
      </Info>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  font-family: "Roboto", sans-serif;
  font-size: 16px;
`

const Form = styled.div`
  border: 1px solid #aaaaaa;
  padding: 20px;
`

const Info = styled.div`
  display: flex;
`

const InfoItem = styled.div`
  flex: 1 1 50%;
`
