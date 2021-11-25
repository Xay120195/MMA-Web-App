exports.handler = async (event) => {
    console.log("Function Invoked with event data:", event)
    const { first, second } = event.arguments
    console.log(`${first} + ${second}`)
    return  first + second
}