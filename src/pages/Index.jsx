import React, { useState } from "react";
import { Container, VStack, HStack, Box, Text, Input, Button, Grid, GridItem, useToast } from "@chakra-ui/react";
import { FaCheckSquare, FaSquare } from "react-icons/fa";

// Custom Checkbox Button Component
const CheckboxButton = ({ isChecked, onClick, text }) => {
  return (
    <Button onClick={onClick} leftIcon={isChecked ? <FaCheckSquare /> : <FaSquare />} size="lg" variant="outline">
      {text}
    </Button>
  );
};

const Index = () => {
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState("");
  const [keypadInput, setKeypadInput] = useState("");
  const [enterPressed, setEnterPressed] = useState(false);
  const toast = useToast();

  const data = {
    100: "Setting A",
    200: "Setting B",
    300: "Setting C",
    // Add more data as needed
  };

  const handleLookup = () => {
    const distance = parseInt(inputValue, 10);
    if (isNaN(distance) || distance < 0 || distance > 9999) {
      toast({
        title: "Error",
        description: "Please enter a number between 0 and 9999",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const setting = data[distance] || "Err_";
    setResult(setting);
    setEnterPressed(true);
  };

  const handleKeypadPress = (value) => {
    if (enterPressed) {
      setKeypadInput("");
      setEnterPressed(false);
    }
    if (keypadInput.length < 4) {
      setKeypadInput(keypadInput + value);
    }
  };

  const handleClear = () => {
    setKeypadInput("");
  };

  const handleInfoPopup = () => {
    toast({
      title: "Information",
      description: "Link 1\nLink 2\nLink 3\nLink 4\nLink 5",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4} width="100%">
        <Box bg="gray.200" p={4} borderRadius="md" width="100%" textAlign="center">
          <Text fontSize="4xl" fontWeight="bold" color="red.500">
            {result}
          </Text>
        </Box>
        <Input placeholder="Distance" value={keypadInput} onChange={(e) => setKeypadInput(e.target.value)} size="lg" maxLength={4} textAlign="center" fontSize="2xl" />
        <Button onClick={handleLookup} size="lg" colorScheme="gray" width="70%">
          Enter
        </Button>
        <Grid templateColumns="repeat(3, 1fr)" gap={4} width="100%">
          {["7", "8", "9", "4", "5", "6", "1", "2", "3", "CLR", "0", "i"].map((value) => (
            <GridItem key={value}>
              <CheckboxButton
                text={value}
                isChecked={false}
                onClick={() => {
                  if (value === "CLR") {
                    handleClear();
                  } else if (value === "i") {
                    handleInfoPopup();
                  } else {
                    handleKeypadPress(value);
                  }
                }}
              />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </Container>
  );
};

export default Index;
