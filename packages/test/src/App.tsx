import { useState } from 'react'

// import './App.css'
import { sleep, userEditor } from './form/Form'


import { Button, Form, Input } from '@arco-design/web-react'
import Test from './form/Test'



function App() {
  const [count, setCount] = useState(0)
  const f = new Set<any>()
  f.add(setCount)
  console.log(Array.from(f).length)
  

  
  return <Test />

  // return (
  //   <Form form={form}>
  //     <F path={[]} />
  //     <div>{count}</div>

  //     {/* <Form.Item field="name" label="姓名" rules={[{
  //       validator: async (v, cb) => {
  //         await sleep(1000)
  //         console.log(v)
  //         cb("error")
  //       }
  //     }]}>
  //       <InputProxy />
  //     </Form.Item> */}
  //     {/* <Form.Item field="company" noStyle>
  //       <Form.Item label="公司名称" required={count < 5} field="company.name">
  //         <Input />
  //       </Form.Item>
  //     </Form.Item> */}

  //     <Button onClick={() => { form.setFieldValue("name", "hello") }}>Test</Button>

  //     <Button onClick={() => setCount(count + 1)}>Count</Button>
  //   </Form>

}

export default App
