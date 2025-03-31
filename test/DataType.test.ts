import { expect } from 'chai';
import { ethers, artifacts } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

describe('DataType', function () {
  let contract: any;
  let owner: any;
  let newWallet: any;
  let recipient: any;

  beforeEach(async function () {
    [owner, newWallet, recipient] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory('DataType');
    contract = await Contract.deploy(recipient.address);
    await contract.waitForDeployment();
  });

  describe('라이선스 및 Solidity 버전 검사', function () {
    it('컨트랙트에서 SPDX 주석으로 라이선스가 있어야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/DataType.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');
      expect(sourceCode.match(/\/\/ SPDX-License-Identifier:/)).to.not.be.null;
    });

    it('컨트랙트에서 Solidity 버전이 0.8.0 이상, 0.9.0 미만이어야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/DataType.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');

      const versionMatch = sourceCode.match(/pragma solidity\s+([^;]+);/);
      expect(versionMatch).to.not.be.null;

      const solidityVersion = versionMatch![1].trim();
      const validVersions = ['>=0.8.0 <0.9.0', '^0.8.0'];

      expect(validVersions.includes(solidityVersion)).to.be.true;
    });
  });

  describe('정수형 값 검사', function () {
    it('초기값으로 positiveNumber가 100이어야 합니다.', async function () {
      expect(await contract.positiveNumber()).to.equal(100);
    });

    it('초기값으로 negativeNumber가 -50이어야 합니다.', async function () {
      expect(await contract.negativeNumber()).to.equal(-50);
    });

    it('setPositiveNumber 호출 후 positiveNumber가 500이어야 합니다.', async function () {
      await contract.setPositiveNumber(500);
      expect(await contract.positiveNumber()).to.equal(500);
    });

    it('setNegativeNumber 호출 후 negativeNumber가 -200이어야 합니다.', async function () {
      await contract.setNegativeNumber(-200);
      expect(await contract.negativeNumber()).to.equal(-200);
    });
  });

  describe('Boolean 값 검사', function () {
    it('초기값으로 isActive가 true여야 합니다.', async function () {
      expect(await contract.isActive()).to.equal(true);
    });

    it('toggleActive 호출 후 isActive가 false가 되어야 합니다.', async function () {
      await contract.toggleActive();
      expect(await contract.isActive()).to.equal(false);
    });

    it('toggleActive를 두 번 호출하면 isActive가 다시 true가 되어야 합니다.', async function () {
      await contract.toggleActive();
      await contract.toggleActive();
      expect(await contract.isActive()).to.equal(true);
    });
  });

  describe('Address 값 검사', function () {
    it('초기값으로 wallet이 0x0000000000000000000000000000000000000000이어야 합니다.', async function () {
      expect(await contract.wallet()).to.equal(
        '0x0000000000000000000000000000000000000000'
      );
    });

    it('초기값으로 recipient가 배포 시 설정한 주소여야 합니다.', async function () {
      expect(await contract.recipient()).to.equal(recipient.address);
    });

    it('setWallet 호출 후 wallet과 recipient가 올바르게 변경되어야 합니다.', async function () {
      await contract.setWallet(newWallet.address);
      expect(await contract.wallet()).to.equal(newWallet.address);
      expect(await contract.recipient()).to.equal(newWallet.address);
    });

    it('recipient가 이더를 받을 수 있어야 합니다.', async function () {
      const tx = await owner.sendTransaction({
        to: contract.recipient(),
        value: ethers.parseEther('1.0'),
      });

      await tx.wait();
      const recipientBalance = await ethers.provider.getBalance(
        contract.recipient()
      );
      expect(recipientBalance).to.be.greaterThan(ethers.parseEther('0.9')); // 가스 비용 고려
    });

    it('wallet 주소가 payable이므로 이더를 받을 수 있어야 합니다.', async function () {
      await contract.setWallet(newWallet.address);

      const tx = await owner.sendTransaction({
        to: contract.wallet(),
        value: ethers.parseEther('0.5'),
      });

      await tx.wait();
      const walletBalance = await ethers.provider.getBalance(contract.wallet());
      expect(walletBalance).to.be.greaterThan(ethers.parseEther('0.4')); // 가스 비용 고려
    });
  });

  describe('Bytes 값 검사', function () {
    it('초기값으로 fixedData가 "0xabcdef123456"으로 설정되어 있어야 합니다.', async function () {
      expect(await contract.fixedData()).to.equal(
        '0x3078616263646566313233343536000000000000000000000000000000000000'
      );
    });

    it('setFixedData 호출 후 fixedData가 올바르게 변경되어야 합니다.', async function () {
      const newFixedData =
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      await contract.setFixedData(newFixedData);
      expect(await contract.fixedData()).to.equal(newFixedData);
    });

    it('setFixedData 호출 시 길이가 32바이트보다 긴 데이터는 설정할 수 없어야 합니다.', async function () {
      const tooLongData = ethers.hexlify(ethers.randomBytes(33));

      try {
        await contract.setFixedData(tooLongData);
      } catch (e) {
        return;
      }

      expect.fail('setFixedData 호출 시 예외가 발생해야 합니다.');
    });

    it('초기값으로 dynamicData가 비어 있어야 합니다.', async function () {
      expect(await contract.dynamicData()).to.equal('0x');
    });

    it('setDynamicData 호출 후 dynamicData가 올바르게 변경되어야 합니다.', async function () {
      const newDynamicData = '0x1234567890abcdef';

      await contract.setDynamicData(newDynamicData);
      expect(await contract.dynamicData()).to.equal(newDynamicData);
    });

    it('setDynamicData 호출 후 getDynamicDataLength() 값이 올바르게 반환되어야 합니다.', async function () {
      const newDynamicData = '0x1234567890abcdef';

      await contract.setDynamicData(newDynamicData);
      expect(await contract.getDynamicDataLength()).to.equal(8);
    });

    it('getDynamicDataAsString()을 호출하면 바이트 데이터가 문자열로 변환되어야 합니다.', async function () {
      const inputString = 'Hello, Solidity!';
      const inputBytes = ethers.encodeBytes32String(inputString); // 32바이트 패딩된 bytes 변환

      await contract.setDynamicData(inputBytes);

      const rawBytes = await contract.getDynamicDataAsString();
      const cleanedString = rawBytes.replace(/\u0000/g, '');

      expect(cleanedString).to.equal(inputString);
    });
  });

  describe('Enum 값 검사', function () {
    it('초기 상태(currentState)는 Active(1)여야 합니다.', async function () {
      expect(await contract.currentState()).to.equal(1);
    });

    it('setState 호출 후 상태를 Created(0)로 변경할 수 있어야 합니다.', async function () {
      await contract.setState(0);
      expect(await contract.currentState()).to.equal(0);
    });

    it('setState 호출 후 상태를 Inactive(2)로 변경할 수 있어야 합니다.', async function () {
      await contract.setState(2);
      expect(await contract.currentState()).to.equal(2);
    });

    it('유효하지 않은 상태 값으로 변경을 시도하면 revert 되어야 합니다.', async function () {
      await expect(contract.setState(3)).to.be.reverted;
    });
  });

  describe('getDetails() 함수 테스트', function () {
    it('getDetails() 호출 시 모든 값들이 올바르게 반환되어야 합니다.(positiveNumber, negativeNumber, isActive, wallet, recipient, fixedData, dynamicData, currentState)', async function () {
      await contract.setPositiveNumber(500);
      await contract.setNegativeNumber(-200);
      await contract.toggleActive();
      await contract.setWallet(newWallet.address);
      await contract.setFixedData(
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      );
      await contract.setDynamicData(ethers.toUtf8Bytes('Hello, Solidity!'));
      await contract.setState(2);

      const details = await contract.getDetails();

      // console.log(details);

      expect(details[0]).to.equal(500);
      expect(details[1]).to.equal(-200);
      expect(details[2]).to.equal(false);
      expect(details[3]).to.equal(newWallet.address);
      expect(details[4]).to.equal(newWallet.address);
      expect(details[5]).to.equal(
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      );
      expect(ethers.toUtf8String(details[6])).to.equal('Hello, Solidity!');
      expect(details[7]).to.equal(2);
    });
  });
});
