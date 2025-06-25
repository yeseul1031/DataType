// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataType {
    // 정수형 변수
    int public positiveNumber = 100;
    int public negativeNumber = -50;

    // 불리언 변수
    bool public isActive = true;

    // 주소형 변수
    address payable public wallet = payable(address(0));
    address public recipient;

    // bytes 관련 변수
    bytes32 public fixedData = bytes32("0xabcdef123456");
    bytes public dynamicData;

    // enum 상태 변수
    enum State { Created, Active, Inactive }
    State public currentState = State.Active;

    // 생성자에서 recipient 설정
    constructor(address _recipient) {
        recipient = _recipient;
    }

    // 정수형 설정 함수
    function setPositiveNumber(int _value) public {
        require(_value >= 0, "Must be positive");
        positiveNumber = _value;
    }

    function setNegativeNumber(int _value) public {
        require(_value < 0, "Must be negative");
        negativeNumber = _value;
    }

    // 불리언 상태 토글
    function toggleActive() public {
        isActive = !isActive;
    }

    // 지갑 주소 설정
    function setWallet(address _wallet) public {
        wallet = payable(_wallet);
        recipient = _wallet;
    }

    // bytes32 고정 길이 데이터 설정
    function setFixedData(bytes32 _data) public {
        fixedData = _data;
    }

    // 동적 바이트 설정
    function setDynamicData(bytes memory _data) public {
        dynamicData = _data;
    }

    // dynamicData 길이 반환
    function getDynamicDataLength() public view returns (uint) {
        return dynamicData.length;
    }

    // dynamicData를 문자열로 변환하여 반환
    function getDynamicDataAsString() public view returns (string memory) {
        return string(dynamicData);
    }

    // enum 상태 변경
    function setState(uint _state) public {
        require(_state <= uint(State.Inactive), "Invalid state");
        currentState = State(_state);
    }

    // 전체 상태 반환
    function getDetails()
        public
        view
        returns (
            int,
            int,
            bool,
            address,
            address,
            bytes32,
            bytes memory,
            uint
        )
    {
        return (
            positiveNumber,
            negativeNumber,
            isActive,
            wallet,
            recipient,
            fixedData,
            dynamicData,
            uint(currentState)
        );
    }

    // 컨트랙트가 이더를 받을 수 있도록 fallback 함수 선언
    receive() external payable {}
    fallback() external payable {}
}

