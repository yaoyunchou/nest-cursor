export const getCozeOutput = (text: string) => {
    if(text){
        const outputData = JSON.parse(text)
        if(outputData && outputData.Output) {
            const baseOutput= JSON.parse(outputData.Output)
            if(baseOutput && baseOutput.output)
            return baseOutput.output
        }

    }
    // 运行失败了
    return null
}