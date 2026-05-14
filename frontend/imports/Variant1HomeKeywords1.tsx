import svgPaths from "./svg-lswrhi7lr2";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

function Container() {
  return (
    <div className="relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[24px]" />
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-[#4a5565] relative rounded-[10px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[40px]">
        <Container />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[12.5%] left-[37.5%] right-[37.5%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-11.11%_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 10">
            <path d={svgPaths.p12f93600} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.33%_12.5%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.26%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 18">
            <path d={svgPaths.p3656c470} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#364153] relative rounded-[10px] shrink-0 size-[44px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[12px] px-[12px] relative size-[44px]">
        <Icon />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[62.5%_20.83%_12.5%_20.83%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
            <path d={svgPaths.p6877e0} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_33.33%_54.17%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
            <path d={svgPaths.p3ffa2780} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[44px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[12px] px-[12px] relative size-[44px]">
        <Icon1 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-3/4 left-[33.33%] right-[66.67%] top-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-25%_-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 5">
            <path d="M0.833333 0.833333V4.16667" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[66.67%] right-[33.33%] top-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-25%_-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 5">
            <path d="M0.833333 0.833333V4.16667" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[16.67%_12.5%_8.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
            <path d={svgPaths.pf3beb80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[41.67%_12.5%_58.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 2">
            <path d="M0.833333 0.833333H15.8333" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[44px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[12px] px-[12px] relative size-[44px]">
        <Icon2 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.39%]" data-name="Vector">
        <div className="absolute inset-[-5.01%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
            <path d={svgPaths.p5c0f9c0} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[35.42%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path d={svgPaths.p3a1977c0} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[44px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[12px] px-[12px] relative size-[44px]">
        <Icon3 />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
            <path d={svgPaths.p2220ad80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[44px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[12px] px-[12px] relative size-[44px]">
        <Icon4 />
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%_16.67%]" data-name="Vector">
        <div className="absolute inset-[-5%_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 19">
            <path d={svgPaths.p2b8e5100} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.33%_16.67%_66.67%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
            <path d={svgPaths.p3b6dc480} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%_58.33%_62.5%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-50%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 2">
            <path d="M2.5 0.833333H0.833333" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[54.17%_33.33%_45.83%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 2">
            <path d="M7.5 0.833333H0.833333" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[70.83%_33.33%_29.17%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 2">
            <path d="M7.5 0.833333H0.833333" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[44px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[12px] px-[12px] relative size-[44px]">
        <Icon5 />
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.41%_12.68%]" data-name="Vector">
        <div className="absolute inset-[-5.01%_-5.58%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 19">
            <path d={svgPaths.p2322a380} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
            <path d={svgPaths.p2314a170} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[44px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[12px] px-[12px] relative size-[44px]">
        <Icon6 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[44px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] h-full items-start pb-0 pt-[32px] px-0 relative w-[44px]">
        <Button />
        <Button1 />
        <Button2 />
        <Button3 />
        <Button4 />
        <Button5 />
        <Button6 />
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="bg-[#1e2939] h-[963px] relative shrink-0 w-[64px]" data-name="Sidebar">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[24px] h-[963px] items-center px-0 py-[24px] relative w-[64px]">
        <Container1 />
        <Container2 />
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="absolute h-[34px] left-[1142px] rounded-[10px] top-[49px] w-[58px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[15.33px] not-italic text-[#4a5565] text-[12px] text-nowrap top-[9px] whitespace-pre">Hide</p>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[24px] relative shrink-0 w-[115.711px]" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[115.711px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Patient Timeline</p>
        <Button7 />
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%_8.34%_8.33%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5.26%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 14">
            <path d={svgPaths.p5810b00} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button8() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-start left-[247px] pb-px pt-[9px] px-[9px] rounded-[10px] size-[34px] top-[4px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Icon7 />
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute bg-gray-50 h-[42px] left-0 rounded-[10px] top-0 w-[235px]" data-name="Text Input">
      <div className="box-border content-stretch flex h-[42px] items-center overflow-clip pl-[40px] pr-[16px] py-[8px] relative rounded-[inherit] w-[235px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#99a1af] text-[16px] text-nowrap tracking-[-0.3125px] whitespace-pre">Search events...</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[13px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M14 14L11.1067 11.1067" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p107a080} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[42px] left-0 top-0 w-[235px]" data-name="Container">
      <TextInput />
      <Icon8 />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[42px] relative shrink-0 w-[281px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[42px] relative w-[281px]">
        <Button8 />
        <Container3 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex h-[42px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Container4 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 10">
            <path d={svgPaths.p2ab2d800} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button9() {
  return (
    <div className="relative rounded-[4px] shrink-0 size-[24px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[4px] px-[4px] relative size-[24px]">
        <Icon9 />
      </div>
    </div>
  );
}

function Button10() {
  return (
    <div className="h-[28px] relative rounded-[4px] shrink-0 w-[42.375px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[42.375px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[4.5px] tracking-[-0.1504px] whitespace-pre">1m</p>
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="h-[28px] relative rounded-[4px] shrink-0 w-[44.664px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[44.664px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[4.5px] tracking-[-0.1504px] whitespace-pre">3m</p>
      </div>
    </div>
  );
}

function Button12() {
  return (
    <div className="basis-0 bg-white grow h-[28px] min-h-px min-w-px relative rounded-[4px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#101828] text-[14px] text-nowrap top-[4.5px] tracking-[-0.1504px] whitespace-pre">6m</p>
      </div>
    </div>
  );
}

function Button13() {
  return (
    <div className="h-[28px] relative rounded-[4px] shrink-0 w-[37.797px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[37.797px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[4.5px] tracking-[-0.1504px] whitespace-pre">1y</p>
      </div>
    </div>
  );
}

function Button14() {
  return (
    <div className="h-[28px] relative rounded-[4px] shrink-0 w-[40.07px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[40.07px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[4.5px] tracking-[-0.1504px] whitespace-pre">All</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-gray-100 h-[36px] relative rounded-[10px] shrink-0 w-[233.703px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[36px] items-start pb-0 pt-[4px] px-[4px] relative w-[233.703px]">
        <Button10 />
        <Button11 />
        <Button12 />
        <Button13 />
        <Button14 />
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 10">
            <path d={svgPaths.p3ec8f700} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button15() {
  return (
    <div className="relative rounded-[4px] shrink-0 size-[24px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[4px] px-[4px] relative size-[24px]">
        <Icon10 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center relative shrink-0 w-full" data-name="Container">
      <Button9 />
      <Container6 />
      <Button15 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[125px] relative shrink-0 w-[1247px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] h-[125px] items-start pb-px pt-[16px] px-[24px] relative w-[1247px]">
        <Container5 />
        <Container7 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[20px] relative shrink-0 w-[128px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] w-[128px]" />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[20px] relative shrink-0 w-[22.977px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[22.977px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Jan</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[20px] relative shrink-0 w-[24.164px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[24.164px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Feb</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[20px] relative shrink-0 w-[24.844px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[24.844px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Mar</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[20px] relative shrink-0 w-[22.859px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[22.859px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Apr</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[20px] relative shrink-0 w-[26.844px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[26.844px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">May</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[20px] relative shrink-0 w-[23.422px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[23.422px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Jun</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[20px] relative shrink-0 w-[18.797px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[18.797px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Jul</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[20px] relative shrink-0 w-[25.344px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[25.344px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Aug</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[20px] relative shrink-0 w-[25.016px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[25.016px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Sep</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[20px] relative shrink-0 w-[23.406px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[23.406px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Oct</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[20px] relative shrink-0 w-[25.531px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[25.531px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Nov</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[20px] relative shrink-0 w-[25.555px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[25.555px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Dec</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start justify-between pl-[16px] pr-[16.008px] py-0 relative w-full">
          <Container10 />
          <Container11 />
          <Container12 />
          <Container13 />
          <Container14 />
          <Container15 />
          <Container16 />
          <Container17 />
          <Container18 />
          <Container19 />
          <Container20 />
          <Container21 />
        </div>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Container22 />
    </div>
  );
}

function Container24() {
  return (
    <div className="bg-gray-50 h-[45px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[45px] items-start pb-px pt-[12px] px-[24px] relative w-full">
          <Container23 />
        </div>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Oncology Events</p>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] top-px w-[85px]">{`Treatment & appointments`}</p>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[4px] h-[64px] items-start left-0 pl-0 pr-[16px] py-0 top-0 w-[128px]" data-name="Container">
      <Container25 />
      <Container26 />
    </div>
  );
}

function Container28() {
  return (
    <div className="basis-0 grow h-[64px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[64px] w-full" />
    </div>
  );
}

function Container29() {
  return (
    <div className="basis-0 grow h-[64px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[64px] w-full" />
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute box-border content-stretch flex h-[64px] items-start left-0 pl-0 py-0 top-0 w-[1071px]" data-name="Container">
      <Container28 />
      {[...Array(11).keys()].map((_, i) => (
        <Container29 key={i} />
      ))}
    </div>
  );
}

function TimelineRow() {
  return (
    <div className="absolute bg-white left-0 rounded-[1.67772e+07px] size-[12px] top-0" data-name="TimelineRow">
      <div aria-hidden="true" className="absolute border-2 border-[#4a5565] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
    </div>
  );
}

function TimelineRow1() {
  return <div className="absolute bg-[#99a1af] h-[16px] left-[5.5px] top-[12px] w-px" data-name="TimelineRow" />;
}

function SlotClone() {
  return (
    <div className="absolute h-[28px] left-[-6px] top-[18px] w-[12px]" data-name="SlotClone">
      <TimelineRow />
      <TimelineRow1 />
    </div>
  );
}

function TimelineRow2() {
  return (
    <div className="absolute bg-white left-0 rounded-[1.67772e+07px] size-[12px] top-0" data-name="TimelineRow">
      <div aria-hidden="true" className="absolute border-2 border-[#4a5565] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
    </div>
  );
}

function TimelineRow3() {
  return <div className="absolute bg-[#99a1af] h-[16px] left-[5.5px] top-[12px] w-px" data-name="TimelineRow" />;
}

function SlotClone1() {
  return (
    <div className="absolute h-[28px] left-[172.5px] top-[18px] w-[12px]" data-name="SlotClone">
      <TimelineRow2 />
      <TimelineRow3 />
    </div>
  );
}

function TimelineRow4() {
  return (
    <div className="absolute bg-[#1e2939] left-0 rounded-[1.67772e+07px] size-[12px] top-0" data-name="TimelineRow">
      <div aria-hidden="true" className="absolute border-2 border-[#101828] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
    </div>
  );
}

function TimelineRow5() {
  return <div className="absolute bg-[#99a1af] h-[16px] left-[5.5px] top-[12px] w-px" data-name="TimelineRow" />;
}

function SlotClone2() {
  return (
    <div className="absolute h-[28px] left-[529.5px] top-[18px] w-[12px]" data-name="SlotClone">
      <TimelineRow4 />
      <TimelineRow5 />
    </div>
  );
}

function TimelineRow6() {
  return (
    <div className="absolute bg-white left-0 rounded-[1.67772e+07px] size-[12px] top-0" data-name="TimelineRow">
      <div aria-hidden="true" className="absolute border-2 border-[#4a5565] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
    </div>
  );
}

function TimelineRow7() {
  return <div className="absolute bg-[#99a1af] h-[16px] left-[5.5px] top-[12px] w-px" data-name="TimelineRow" />;
}

function SlotClone3() {
  return (
    <div className="absolute h-[28px] left-[708px] top-[18px] w-[12px]" data-name="SlotClone">
      <TimelineRow6 />
      <TimelineRow7 />
    </div>
  );
}

function TimelineRow8() {
  return (
    <div className="absolute bg-[#1e2939] left-0 rounded-[1.67772e+07px] size-[12px] top-0" data-name="TimelineRow">
      <div aria-hidden="true" className="absolute border-2 border-[#101828] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
    </div>
  );
}

function TimelineRow9() {
  return <div className="absolute bg-[#99a1af] h-[16px] left-[5.5px] top-[12px] w-px" data-name="TimelineRow" />;
}

function SlotClone4() {
  return (
    <div className="absolute h-[28px] left-[797.25px] top-[18px] w-[12px]" data-name="SlotClone">
      <TimelineRow8 />
      <TimelineRow9 />
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute h-[64px] left-0 top-0 w-[1071px]" data-name="Container">
      <SlotClone />
      <SlotClone1 />
      <SlotClone2 />
      <SlotClone3 />
      <SlotClone4 />
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute h-[64px] left-[128px] top-0 w-[1071px]" data-name="Container">
      <Container30 />
      <Container31 />
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="Container">
      <Container27 />
      <Container32 />
    </div>
  );
}

function TimelineRow10() {
  return (
    <div className="box-border content-stretch flex flex-col h-[97px] items-start pb-px pt-[16px] px-0 relative shrink-0 w-full" data-name="TimelineRow">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <Container33 />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Chemotherapy</p>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] top-px w-[90px]">Treatment cycles & regimens</p>
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[4px] h-[64px] items-start left-0 pl-0 pr-[16px] py-0 top-0 w-[128px]" data-name="Container">
      <Container34 />
      <Container35 />
    </div>
  );
}

function Container37() {
  return (
    <div className="basis-0 grow h-[64px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[64px] w-full" />
    </div>
  );
}

function Container38() {
  return (
    <div className="basis-0 grow h-[64px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[64px] w-full" />
    </div>
  );
}

function Container39() {
  return (
    <div className="absolute box-border content-stretch flex h-[64px] items-start left-0 pl-0 py-0 top-0 w-[1071px]" data-name="Container">
      <Container37 />
      {[...Array(11).keys()].map((_, i) => (
        <Container38 key={i} />
      ))}
    </div>
  );
}

function Container40() {
  return <div className="bg-[#1e2939] h-[8px] rounded-[1.67772e+07px] shrink-0 w-full" data-name="Container" />;
}

function Container41() {
  return (
    <div className="absolute bg-[#4a5565] box-border content-stretch flex flex-col h-[8px] items-start left-0 pl-0 pr-[1063px] py-0 rounded-[1.67772e+07px] top-[28px] w-[1071px]" data-name="Container">
      <Container40 />
    </div>
  );
}

function Container42() {
  return <div className="absolute bg-[#1e2939] left-0 rounded-[1.67772e+07px] size-[8px] top-0" data-name="Container" />;
}

function Container43() {
  return (
    <div className="absolute bg-[#727d8e] h-[8px] left-[-0.25px] rounded-[1.67772e+07px] top-[10px] w-[625px]" data-name="Container">
      <div className="size-full">
        <div className="h-[8px] w-[625px]" />
      </div>
    </div>
  );
}

function Container44() {
  return <div className="absolute bg-[#1e2939] left-0 rounded-[1.67772e+07px] size-[8px] top-[10px]" data-name="Container" />;
}

function Container45() {
  return <div className="absolute bg-[#1e2939] left-[172px] rounded-[1.67772e+07px] size-[8px] top-[10px]" data-name="Container" />;
}

function Container46() {
  return <div className="absolute bg-[#1e2939] left-[309px] rounded-[1.67772e+07px] size-[8px] top-[10px]" data-name="Container" />;
}

function Container47() {
  return <div className="absolute bg-[#1e2939] left-[617px] rounded-[1.67772e+07px] size-[8px] top-[10px]" data-name="Container" />;
}

function Group() {
  return (
    <div className="absolute contents left-[-0.25px] top-[10px]">
      <Container43 />
      <Container44 />
      <Container45 />
      <Container46 />
      <Container47 />
    </div>
  );
}

function Container48() {
  return <div className="absolute bg-[#1e2939] left-[259.75px] rounded-[1.67772e+07px] size-[8px] top-0" data-name="Container" />;
}

function Container49() {
  return (
    <div className="absolute bg-[#4a5565] h-[8px] left-[89.25px] rounded-[1.67772e+07px] top-[28px] w-[267.75px]" data-name="Container">
      <Container42 />
      <Group />
      <Container48 />
    </div>
  );
}

function Container50() {
  return <div className="bg-[#1e2939] h-[8px] rounded-[1.67772e+07px] shrink-0 w-full" data-name="Container" />;
}

function Container51() {
  return (
    <div className="absolute bg-[#4a5565] box-border content-stretch flex flex-col h-[8px] items-start left-[535.5px] pl-0 pr-[527.5px] py-0 rounded-[1.67772e+07px] top-[28px] w-[535.5px]" data-name="Container">
      <Container50 />
    </div>
  );
}

function Container52() {
  return <div className="bg-[#1e2939] h-[8px] rounded-[1.67772e+07px] shrink-0 w-full" data-name="Container" />;
}

function Container53() {
  return (
    <div className="absolute bg-[#4a5565] box-border content-stretch flex flex-col h-[8px] items-start left-[714px] pl-0 pr-[349px] py-0 rounded-[1.67772e+07px] top-[28px] w-[357px]" data-name="Container">
      <Container52 />
    </div>
  );
}

function Container54() {
  return <div className="bg-[#1e2939] h-[8px] rounded-[1.67772e+07px] shrink-0 w-full" data-name="Container" />;
}

function Container55() {
  return (
    <div className="absolute bg-[#4a5565] box-border content-stretch flex flex-col h-[8px] items-start left-[803.25px] pl-0 pr-[259.75px] py-0 rounded-[1.67772e+07px] top-[28px] w-[267.75px]" data-name="Container">
      <Container54 />
    </div>
  );
}

function Container56() {
  return (
    <div className="absolute h-[64px] left-0 top-0 w-[1071px]" data-name="Container">
      <Container41 />
      <Container49 />
      <Container51 />
      <Container53 />
      <Container55 />
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute h-[64px] left-[128px] top-0 w-[1071px]" data-name="Container">
      <Container39 />
      <Container56 />
    </div>
  );
}

function Container58() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="Container">
      <Container36 />
      <Container57 />
    </div>
  );
}

function TimelineRow11() {
  return (
    <div className="box-border content-stretch flex flex-col h-[97px] items-start pb-px pt-[16px] px-0 relative shrink-0 w-full" data-name="TimelineRow">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <Container58 />
    </div>
  );
}

function Container59() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Side Effects</p>
    </div>
  );
}

function Container60() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] top-px w-[99px]">{`Treatment reactions & symptoms`}</p>
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[4px] h-[64px] items-start left-0 pl-0 pr-[16px] py-0 top-0 w-[128px]" data-name="Container">
      <Container59 />
      <Container60 />
    </div>
  );
}

function Container62() {
  return (
    <div className="basis-0 grow h-[64px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[64px] w-full" />
    </div>
  );
}

function Container63() {
  return (
    <div className="basis-0 grow h-[64px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[64px] w-full" />
    </div>
  );
}

function Container64() {
  return (
    <div className="absolute box-border content-stretch flex h-[64px] items-start left-0 pl-0 py-0 top-0 w-[1071px]" data-name="Container">
      <Container62 />
      {[...Array(11).keys()].map((_, i) => (
        <Container63 key={i} />
      ))}
    </div>
  );
}

function TimelineRow12() {
  return <div className="absolute bg-[#364153] left-0 rounded-[1.67772e+07px] size-[12px] top-0" data-name="TimelineRow" />;
}

function TimelineRow13() {
  return <div className="absolute bg-[#99a1af] h-[16px] left-[5.5px] top-[12px] w-px" data-name="TimelineRow" />;
}

function SlotClone5() {
  return (
    <div className="absolute h-[28px] left-[83.25px] top-[18px] w-[12px]" data-name="SlotClone">
      <TimelineRow12 />
      <TimelineRow13 />
    </div>
  );
}

function TimelineRow14() {
  return <div className="absolute bg-[#364153] left-0 rounded-[1.67772e+07px] size-[12px] top-0" data-name="TimelineRow" />;
}

function TimelineRow15() {
  return <div className="absolute bg-[#99a1af] h-[16px] left-[5.5px] top-[12px] w-px" data-name="TimelineRow" />;
}

function SlotClone6() {
  return (
    <div className="absolute h-[28px] left-[351px] top-[18px] w-[12px]" data-name="SlotClone">
      <TimelineRow14 />
      <TimelineRow15 />
    </div>
  );
}

function TimelineRow16() {
  return <div className="absolute bg-[#364153] left-0 rounded-[1.67772e+07px] size-[12px] top-0" data-name="TimelineRow" />;
}

function TimelineRow17() {
  return <div className="absolute bg-[#99a1af] h-[16px] left-[5.5px] top-[12px] w-px" data-name="TimelineRow" />;
}

function SlotClone7() {
  return (
    <div className="absolute h-[28px] left-[797.25px] top-[18px] w-[12px]" data-name="SlotClone">
      <TimelineRow16 />
      <TimelineRow17 />
    </div>
  );
}

function Container65() {
  return (
    <div className="absolute h-[64px] left-0 top-0 w-[1071px]" data-name="Container">
      <SlotClone5 />
      <SlotClone6 />
      <SlotClone7 />
    </div>
  );
}

function Container66() {
  return (
    <div className="absolute h-[64px] left-[128px] top-0 w-[1071px]" data-name="Container">
      <Container64 />
      <Container65 />
    </div>
  );
}

function Container67() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="Container">
      <Container61 />
      <Container66 />
    </div>
  );
}

function TimelineRow18() {
  return (
    <div className="box-border content-stretch flex flex-col h-[97px] items-start pb-px pt-[16px] px-0 relative shrink-0 w-full" data-name="TimelineRow">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <Container67 />
    </div>
  );
}

function Container68() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Clinical Trials</p>
    </div>
  );
}

function Container69() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] top-px w-[85px]">Study participation & data</p>
    </div>
  );
}

function Container70() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[4px] h-[64px] items-start left-0 pl-0 pr-[16px] py-0 top-0 w-[128px]" data-name="Container">
      <Container68 />
      <Container69 />
    </div>
  );
}

function Container71() {
  return (
    <div className="basis-0 grow h-[64px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[64px] w-full" />
    </div>
  );
}

function Container72() {
  return (
    <div className="basis-0 grow h-[64px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[64px] w-full" />
    </div>
  );
}

function Container73() {
  return (
    <div className="absolute box-border content-stretch flex h-[64px] items-start left-0 pl-0 py-0 top-0 w-[1071px]" data-name="Container">
      <Container71 />
      {[...Array(11).keys()].map((_, i) => (
        <Container72 key={i} />
      ))}
    </div>
  );
}

function Container74() {
  return (
    <div className="absolute h-[64px] left-[128px] top-0 w-[1071px]" data-name="Container">
      <Container73 />
    </div>
  );
}

function Container75() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="Container">
      <Container70 />
      <Container74 />
    </div>
  );
}

function TimelineRow19() {
  return (
    <div className="box-border content-stretch flex flex-col h-[97px] items-start pb-px pt-[16px] px-0 relative shrink-0 w-full" data-name="TimelineRow">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <Container75 />
    </div>
  );
}

function Container76() {
  return (
    <div className="h-[388px] relative shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[388px] items-start px-[24px] py-0 relative w-full">
          <TimelineRow10 />
          <TimelineRow11 />
          <TimelineRow18 />
          <TimelineRow19 />
        </div>
      </div>
    </div>
  );
}

function Container77() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[1247px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-full items-start overflow-clip relative rounded-[inherit] w-[1247px]">
        <Container24 />
        <Container76 />
      </div>
    </div>
  );
}

function Timeline() {
  return (
    <div className="absolute bg-white h-[561px] left-0 top-0 w-[1247px]" data-name="Timeline">
      <div className="box-border content-stretch flex flex-col h-[561px] items-start overflow-clip pb-px pt-0 px-0 relative rounded-[inherit] w-[1247px]">
        <Container8 />
        <Container77 />
      </div>
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p399eca00} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pc93b400} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Patient Info</p>
      </div>
    </div>
  );
}

function Container78() {
  return (
    <div className="h-[20px] relative shrink-0 w-[97.227px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[20px] items-center relative w-[97.227px]">
        <Icon11 />
        <Text />
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%_12.5%_62.5%_62.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
            <path d="M0.5 0.5H3.5V3.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_12.5%_58.33%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <path d="M4 0.5L0.5 4" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_58.33%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <path d="M0.5 4L4 0.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[62.5%_62.5%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
            <path d="M3.5 3.5H0.5V0.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button16() {
  return (
    <div className="relative rounded-[4px] shrink-0 size-[20px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[4px] px-[4px] relative size-[20px]">
        <Icon12 />
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div className="bg-gray-50 h-[45px] relative shrink-0 w-[392.336px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[45px] items-center justify-between pb-px pt-0 px-[16px] relative w-[392.336px]">
        <Container78 />
        <Button16 />
      </div>
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p67f12c8} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p2c19cb00} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container80() {
  return (
    <div className="bg-[#d1d5dc] relative rounded-[1.67772e+07px] shrink-0 size-[48px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[48px]">
        <Icon13 />
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Sarah Chen</p>
    </div>
  );
}

function Container82() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">MRN: ONC-87452</p>
    </div>
  );
}

function Container83() {
  return (
    <div className="h-[36px] relative shrink-0 w-[91.609px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-[91.609px]">
        <Container81 />
        <Container82 />
      </div>
    </div>
  );
}

function Container84() {
  return (
    <div className="content-stretch flex gap-[12px] h-[48px] items-start relative shrink-0 w-full" data-name="Container">
      <Container80 />
      <Container83 />
    </div>
  );
}

function Container85() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">DOB</p>
    </div>
  );
}

function Container86() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] text-nowrap top-px whitespace-pre">03/22/1968</p>
    </div>
  );
}

function Container87() {
  return (
    <div className="absolute content-stretch flex flex-col h-[32px] items-start left-0 top-0 w-[174.164px]" data-name="Container">
      <Container85 />
      <Container86 />
    </div>
  );
}

function Container88() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Age</p>
    </div>
  );
}

function Container89() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] text-nowrap top-px whitespace-pre">57 years</p>
    </div>
  );
}

function Container90() {
  return (
    <div className="absolute content-stretch flex flex-col h-[32px] items-start left-[186.16px] top-0 w-[174.172px]" data-name="Container">
      <Container88 />
      <Container89 />
    </div>
  );
}

function Container91() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Gender</p>
    </div>
  );
}

function Container92() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] text-nowrap top-px whitespace-pre">Female</p>
    </div>
  );
}

function Container93() {
  return (
    <div className="absolute content-stretch flex flex-col h-[32px] items-start left-0 top-[44px] w-[174.164px]" data-name="Container">
      <Container91 />
      <Container92 />
    </div>
  );
}

function Container94() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Cancer Type</p>
    </div>
  );
}

function Container95() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] text-nowrap top-px whitespace-pre">Breast (Stage II)</p>
    </div>
  );
}

function Container96() {
  return (
    <div className="absolute content-stretch flex flex-col h-[32px] items-start left-[186.16px] top-[44px] w-[174.172px]" data-name="Container">
      <Container94 />
      <Container95 />
    </div>
  );
}

function Container97() {
  return (
    <div className="h-[76px] relative shrink-0 w-full" data-name="Container">
      <Container87 />
      <Container90 />
      <Container93 />
      <Container96 />
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_1_510)" id="Icon">
          <path d={svgPaths.p3d16e300} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_1_510">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[16px] relative shrink-0 w-[90.398px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[90.398px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] text-nowrap top-px whitespace-pre">(555) 892-3441</p>
      </div>
    </div>
  );
}

function Container98() {
  return (
    <div className="content-stretch flex gap-[8px] h-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon14 />
      <Text1 />
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p583e000} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.pcd45380} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[16px] relative shrink-0 w-[117.266px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[117.266px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] text-nowrap top-px whitespace-pre">s.chen@email.com</p>
      </div>
    </div>
  );
}

function Container99() {
  return (
    <div className="content-stretch flex gap-[8px] h-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon15 />
      <Text2 />
    </div>
  );
}

function Icon16() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2023d200} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p2d617c80} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[16px] relative shrink-0 w-[116.844px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[116.844px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] text-nowrap top-px whitespace-pre">123 Main St, City, ST</p>
      </div>
    </div>
  );
}

function Container100() {
  return (
    <div className="content-stretch flex gap-[8px] h-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon16 />
      <Text3 />
    </div>
  );
}

function Container101() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[64px] items-start relative shrink-0 w-full" data-name="Container">
      <Container98 />
      <Container99 />
      <Container100 />
    </div>
  );
}

function Container102() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Treatment Markers</p>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[16px] relative shrink-0 w-[15.516px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[15.516px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] text-nowrap top-px whitespace-pre">CA 15-3</p>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[16px] relative shrink-0 w-[39.25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[39.25px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] text-nowrap top-px whitespace-pre">22.5</p>
      </div>
    </div>
  );
}

function Container103() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-center justify-between left-0 top-0 w-[176.164px]" data-name="Container">
      <Text4 />
      <Text5 />
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[16px] relative shrink-0 w-[16.75px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[16.75px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] text-nowrap top-px whitespace-pre">WBC</p>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[16px] relative shrink-0 w-[42.586px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[42.586px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] text-nowrap top-px whitespace-pre">4.2 K/μL</p>
      </div>
    </div>
  );
}

function Container104() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-center justify-between left-[184.16px] top-0 w-[176.172px]" data-name="Container">
      <Text6 />
      <Text7 />
    </div>
  );
}

function Text8() {
  return (
    <div className="h-[16px] relative shrink-0 w-[31.055px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[31.055px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] text-nowrap top-px whitespace-pre">Platelets</p>
      </div>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[16px] relative shrink-0 w-[38.156px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[38.156px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] text-nowrap top-px whitespace-pre">185 K/μL</p>
      </div>
    </div>
  );
}

function Container105() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-center justify-between left-0 top-[24px] w-[176.164px]" data-name="Container">
      <Text8 />
      <Text9 />
    </div>
  );
}

function Text10() {
  return (
    <div className="h-[16px] relative shrink-0 w-[16.5px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[16.5px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] text-nowrap top-px whitespace-pre">Hgb</p>
      </div>
    </div>
  );
}

function Text11() {
  return (
    <div className="h-[16px] relative shrink-0 w-[26.414px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[26.414px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] text-nowrap top-px whitespace-pre">11.8 g/dL</p>
      </div>
    </div>
  );
}

function Container106() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-center justify-between left-[184.16px] top-[24px] w-[176.172px]" data-name="Container">
      <Text10 />
      <Text11 />
    </div>
  );
}

function Container107() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Container">
      <Container103 />
      <Container104 />
      <Container105 />
      <Container106 />
    </div>
  );
}

function Container108() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[8px] h-[77px] items-start pb-0 pt-[13px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <Container102 />
      <Container107 />
    </div>
  );
}

function Container109() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[301px] items-start relative shrink-0 w-full" data-name="Container">
      <Container84 />
      <Container97 />
      <Container101 />
      <Container108 />
    </div>
  );
}

function Container110() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[392.336px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-full items-start overflow-clip pb-0 pt-[16px] px-[16px] relative rounded-[inherit] w-[392.336px]">
        <Container109 />
      </div>
    </div>
  );
}

function Container111() {
  return (
    <div className="basis-0 bg-white grow h-[550px] min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[550px] items-start overflow-clip p-px relative rounded-[inherit] w-full">
        <Container79 />
        <Container110 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p405f80} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text12() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">AI Assistant</p>
      </div>
    </div>
  );
}

function Container112() {
  return (
    <div className="h-[20px] relative shrink-0 w-[99.914px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[20px] items-center relative w-[99.914px]">
        <Icon17 />
        <Text12 />
      </div>
    </div>
  );
}

function Icon18() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%_12.5%_62.5%_62.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
            <path d="M0.5 0.5H3.5V3.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_12.5%_58.33%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <path d="M4 0.5L0.5 4" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_58.33%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <path d="M0.5 4L4 0.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[62.5%_62.5%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
            <path d="M3.5 3.5H0.5V0.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button17() {
  return (
    <div className="relative rounded-[4px] shrink-0 size-[20px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[4px] px-[4px] relative size-[20px]">
        <Icon18 />
      </div>
    </div>
  );
}

function Container113() {
  return (
    <div className="bg-gray-50 h-[45px] relative shrink-0 w-[392.336px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[45px] items-center justify-between pb-px pt-0 px-[16px] relative w-[392.336px]">
        <Container112 />
        <Button17 />
      </div>
    </div>
  );
}

function Icon19() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p1fa05100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Container114() {
  return (
    <div className="bg-[#4a5565] relative rounded-[1.67772e+07px] shrink-0 size-[24px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[24px]">
        <Icon19 />
      </div>
    </div>
  );
}

function Container115() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] top-px w-[254px]">Hello! I can help you review treatment protocols, analyze tumor markers, or answer questions about oncology care plans.</p>
    </div>
  );
}

function Container116() {
  return (
    <div className="bg-gray-100 h-[64px] relative rounded-[10px] shrink-0 w-[288.266px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[64px] items-start pb-0 pt-[8px] px-[12px] relative w-[288.266px]">
        <Container115 />
      </div>
    </div>
  );
}

function Container117() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[64px] items-start left-[16px] top-[16px] w-[360.336px]" data-name="Container">
      <Container114 />
      <Container116 />
    </div>
  );
}

function Container118() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[12px] text-white top-px w-[236px]">What is the current chemotherapy regimen for this patient?</p>
    </div>
  );
}

function Container119() {
  return (
    <div className="absolute bg-[#364153] box-border content-stretch flex flex-col h-[48px] items-start left-[88.07px] pb-0 pt-[8px] px-[12px] rounded-[10px] top-[92px] w-[288.266px]" data-name="Container">
      <Container118 />
    </div>
  );
}

function Icon20() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p1fa05100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Container120() {
  return (
    <div className="bg-[#4a5565] relative rounded-[1.67772e+07px] shrink-0 size-[24px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[24px]">
        <Icon20 />
      </div>
    </div>
  );
}

function Container121() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] top-px w-[257px]">The patient is on AC-T protocol: Doxorubicin 60mg/m², Cyclophosphamide 600mg/m² (4 cycles), followed by Paclitaxel 175mg/m² (12 weekly doses).</p>
    </div>
  );
}

function Container122() {
  return (
    <div className="bg-gray-100 h-[64px] relative rounded-[10px] shrink-0 w-[288.266px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[64px] items-start pb-0 pt-[8px] px-[12px] relative w-[288.266px]">
        <Container121 />
      </div>
    </div>
  );
}

function Container123() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[64px] items-start left-[16px] top-[152px] w-[360.336px]" data-name="Container">
      <Container120 />
      <Container122 />
    </div>
  );
}

function TextInput1() {
  return (
    <div className="basis-0 bg-gray-50 grow h-[38px] min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[38px] items-center px-[12px] py-[8px] relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#99a1af] text-[14px] text-nowrap tracking-[-0.1504px] whitespace-pre">Ask a question...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Icon21() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.32%_8.32%_8.33%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
            <path d={svgPaths.p185227c0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.95%_8.94%_45.48%_45.48%]" data-name="Vector">
        <div className="absolute inset-[-9.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
            <path d={svgPaths.p2db0e900} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button18() {
  return (
    <div className="bg-[#364153] relative rounded-[10px] shrink-0 size-[32px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[8px] px-[8px] relative size-[32px]">
        <Icon21 />
      </div>
    </div>
  );
}

function Container124() {
  return (
    <div className="content-stretch flex gap-[8px] h-[38px] items-center relative shrink-0 w-full" data-name="Container">
      <TextInput1 />
      <Button18 />
    </div>
  );
}

function Container125() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[63px] items-start left-[0.66px] pb-0 pt-[13px] px-[12px] top-[248px] w-[392.336px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <Container124 />
    </div>
  );
}

function Container126() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[392.336px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full overflow-clip relative rounded-[inherit] w-[392.336px]">
        <Container117 />
        <Container119 />
        <Container123 />
        <Container125 />
      </div>
    </div>
  );
}

function TextInput2() {
  return (
    <div className="basis-0 bg-gray-50 grow h-[38px] min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[38px] items-center px-[12px] py-[8px] relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#99a1af] text-[14px] text-nowrap tracking-[-0.1504px] whitespace-pre">Ask a question...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Icon22() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.32%_8.32%_8.33%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
            <path d={svgPaths.p185227c0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.95%_8.94%_45.48%_45.48%]" data-name="Vector">
        <div className="absolute inset-[-9.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
            <path d={svgPaths.p2db0e900} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button19() {
  return (
    <div className="bg-[#364153] relative rounded-[10px] shrink-0 size-[32px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[8px] px-[8px] relative size-[32px]">
        <Icon22 />
      </div>
    </div>
  );
}

function Container127() {
  return (
    <div className="content-stretch flex gap-[8px] h-[38px] items-center relative shrink-0 w-full" data-name="Container">
      <TextInput2 />
      <Button19 />
    </div>
  );
}

function Container128() {
  return (
    <div className="h-[63px] relative shrink-0 w-[392.336px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[63px] items-start pb-0 pt-[13px] px-[12px] relative w-[392.336px]">
        <Container127 />
      </div>
    </div>
  );
}

function Container129() {
  return (
    <div className="basis-0 bg-white grow h-[550px] min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[550px] items-start overflow-clip p-px relative rounded-[inherit] w-full">
        <Container113 />
        <Container126 />
        <Container128 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Icon23() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p32c00400} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2f10900} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M6.66667 6H5.33333" id="Vector_3" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M10.6667 8.66667H5.33333" id="Vector_4" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M10.6667 11.3333H5.33333" id="Vector_5" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text13() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Clinical Notes</p>
      </div>
    </div>
  );
}

function Container130() {
  return (
    <div className="h-[20px] relative shrink-0 w-[112.555px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[20px] items-center relative w-[112.555px]">
        <Icon23 />
        <Text13 />
      </div>
    </div>
  );
}

function Icon24() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%_12.5%_62.5%_62.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
            <path d="M0.5 0.5H3.5V3.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_12.5%_58.33%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <path d="M4 0.5L0.5 4" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_58.33%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <path d="M0.5 4L4 0.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[62.5%_62.5%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
            <path d="M3.5 3.5H0.5V0.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button20() {
  return (
    <div className="relative rounded-[4px] shrink-0 size-[20px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[4px] px-[4px] relative size-[20px]">
        <Icon24 />
      </div>
    </div>
  );
}

function Container131() {
  return (
    <div className="bg-gray-50 h-[45px] relative shrink-0 w-[392.336px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[45px] items-center justify-between pb-px pt-0 px-[16px] relative w-[392.336px]">
        <Container130 />
        <Button20 />
      </div>
    </div>
  );
}

function Container132() {
  return (
    <div className="h-[16px] relative shrink-0 w-[91.273px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[91.273px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] text-nowrap top-px whitespace-pre">Chemo Session</p>
      </div>
    </div>
  );
}

function Container133() {
  return (
    <div className="h-[16px] relative shrink-0 w-[74.719px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[74.719px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Oct 28, 2025</p>
      </div>
    </div>
  );
}

function Container134() {
  return (
    <div className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container132 />
      <Container133 />
    </div>
  );
}

function Container135() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] text-nowrap top-px whitespace-pre">Cycle 3 completed. Mild nausea managed...</p>
    </div>
  );
}

function Container136() {
  return (
    <div className="h-[62px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[4px] h-[62px] items-start pb-px pt-[13px] px-[13px] relative w-full">
          <Container134 />
          <Container135 />
        </div>
      </div>
    </div>
  );
}

function Container137() {
  return (
    <div className="h-[16px] relative shrink-0 w-[130.82px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[130.82px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] text-nowrap top-px whitespace-pre">Oncology Consultation</p>
      </div>
    </div>
  );
}

function Container138() {
  return (
    <div className="h-[16px] relative shrink-0 w-[68.609px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[68.609px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Sep 5, 2025</p>
      </div>
    </div>
  );
}

function Container139() {
  return (
    <div className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container137 />
      <Container138 />
    </div>
  );
}

function Container140() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] text-nowrap top-px whitespace-pre">Tumor markers trending down...</p>
    </div>
  );
}

function Container141() {
  return (
    <div className="h-[62px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[4px] h-[62px] items-start pb-px pt-[13px] px-[13px] relative w-full">
          <Container139 />
          <Container140 />
        </div>
      </div>
    </div>
  );
}

function Container142() {
  return (
    <div className="h-[16px] relative shrink-0 w-[43.023px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[43.023px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#101828] text-[12px] text-nowrap top-px whitespace-pre">CT Scan</p>
      </div>
    </div>
  );
}

function Container143() {
  return (
    <div className="h-[16px] relative shrink-0 w-[68.93px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[68.93px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Jul 10, 2025</p>
      </div>
    </div>
  );
}

function Container144() {
  return (
    <div className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container142 />
      <Container143 />
    </div>
  );
}

function Container145() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] text-nowrap top-px whitespace-pre">No new metastasis detected...</p>
    </div>
  );
}

function Container146() {
  return (
    <div className="h-[62px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[4px] h-[62px] items-start pb-px pt-[13px] px-[13px] relative w-full">
          <Container144 />
          <Container145 />
        </div>
      </div>
    </div>
  );
}

function Button21() {
  return (
    <div className="h-[34px] relative rounded-[10px] shrink-0 w-[112px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[15.33px] not-italic text-[#4a5565] text-[12px] text-nowrap top-[9px] whitespace-pre">View All Notes</p>
    </div>
  );
}

function Container147() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[392.336px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[12px] h-full items-start overflow-clip pb-0 pt-[16px] px-[16px] relative rounded-[inherit] w-[392.336px]">
        <Container136 />
        <Container141 />
        <Container146 />
        <Button21 />
      </div>
    </div>
  );
}

function Container148() {
  return (
    <div className="basis-0 bg-white grow h-[550px] min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[550px] items-start overflow-clip p-px relative rounded-[inherit] w-full">
        <Container131 />
        <Container147 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function BottomPanels({ panelHeight }: any) {
  const contentHeight = panelHeight - 9;
  return (
    <div 
      className="absolute bg-gray-100 box-border content-stretch flex gap-[16px] items-start left-0 pb-0 pl-[16px] pr-[15.992px] pt-[16px] top-[9px] w-[1247px] overflow-hidden" 
      style={{ height: `${contentHeight}px` }}
      data-name="BottomPanels"
    >
      <Container111 />
      <Container129 />
      <Container148 />
    </div>
  );
}

function Container149({ handleDragStart }: any) {
  return (
    <div 
      className="absolute bg-[#99a1af] h-[4px] left-[599.5px] rounded-[1.67772e+07px] top-[3px] w-[48px] cursor-ns-resize hover:bg-[#6a7282] transition-colors" 
      data-name="Container"
      onMouseDown={handleDragStart}
    />
  );
}

function ResizablePanel({ panelHeight, handleDragStart }: any) {
  const topPosition = 963 - panelHeight - 70; // 70px for keywords bar
  return (
    <div 
      className="absolute bg-gray-100 left-0 w-[1247px] transition-all duration-150" 
      style={{ height: `${panelHeight}px`, top: `${topPosition}px` }}
      data-name="ResizablePanel"
    >
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <BottomPanels panelHeight={panelHeight} />
      <Container149 handleDragStart={handleDragStart} />
    </div>
  );
}

function Container150({ dialogState, panelHeight, handleDragStart }: any) {
  return (
    <div className="basis-0 grow h-[963px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[963px] overflow-clip relative rounded-[inherit] w-full">
        <Timeline dialogState={dialogState} />
        <ResizablePanel panelHeight={panelHeight} handleDragStart={handleDragStart} />
      </div>
    </div>
  );
}

function Variant1HomeCollapsed({ dialogState, panelHeight, handleDragStart }: any) {
  return (
    <div className="absolute bg-gray-100 content-stretch flex h-[963px] items-start left-0 top-0 w-[1311px]" data-name="Variant 1 / Home collapsed">
      <Sidebar />
      <Container150 dialogState={dialogState} panelHeight={panelHeight} handleDragStart={handleDragStart} />
    </div>
  );
}

function Icon25() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_1_572)" id="Icon">
          <path d={svgPaths.pc986e80} id="Vector" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M11.6667 1.16667V3.5" id="Vector_2" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M12.8333 2.33333H10.5" id="Vector_3" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p291dcf00} id="Vector_4" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
        <defs>
          <clipPath id="clip0_1_572">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text14() {
  return (
    <div className="basis-0 grow h-[16px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#4a5565] text-[12px] text-nowrap top-px whitespace-pre">Keywords</p>
      </div>
    </div>
  );
}

function Container151() {
  return (
    <div className="h-[16px] relative shrink-0 w-[76px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[6px] h-[16px] items-center relative w-[76px]">
        <Icon25 />
        <Text14 />
      </div>
    </div>
  );
}

function Icon26() {
  return (
    <div className="size-[12px] shrink-0" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d="M8 3.5H11V6.5" id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3a7e7417} id="Vector_2" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Button22() {
  return (
    <div className="bg-blue-100 h-[26px] relative rounded-[1.67772e+07px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#bedbff] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[26px] relative px-[9px] py-[5px] flex items-center gap-[6px]">
        <Icon26 />
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic text-[#1447e6] text-[12px] text-nowrap whitespace-pre">Tumor Shrinking</p>
      </div>
    </div>
  );
}

function Icon27() {
  return (
    <div className="absolute left-[9px] size-[12px] top-[7px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d="M8 3.5H11V6.5" id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3a7e7417} id="Vector_2" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Button23() {
  return (
    <div className="bg-blue-100 h-[26px] relative rounded-[1.67772e+07px] shrink-0 w-[117.219px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#bedbff] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[26px] relative w-[117.219px]">
        <Icon27 />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[27px] not-italic text-[#1447e6] text-[12px] text-nowrap top-[6px] whitespace-pre">A1C Improving</p>
      </div>
    </div>
  );
}

function Icon28() {
  return (
    <div className="absolute left-[9px] size-[12px] top-[7px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2259a100} id="Vector" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 4.5V6.5" id="Vector_2" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 8.5H6.005" id="Vector_3" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Button24() {
  return (
    <div className="bg-[#ffedd4] h-[26px] relative rounded-[1.67772e+07px] shrink-0 w-[128.602px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#ffd6a7] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[26px] relative w-[128.602px]">
        <Icon28 />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[27px] not-italic text-[#ca3500] text-[12px] text-nowrap top-[6px] whitespace-pre">Penicillin Allergy</p>
      </div>
    </div>
  );
}

function Button25() {
  return (
    <div className="bg-gray-100 h-[26px] relative rounded-[1.67772e+07px] shrink-0 w-[136.203px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[6px] h-[26px] items-center px-[9px] py-[5px] relative w-[136.203px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#364153] text-[12px] text-nowrap whitespace-pre">4 Active Medications</p>
      </div>
    </div>
  );
}

function Icon29() {
  return (
    <div className="absolute left-[9px] size-[12px] top-[7px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2259a100} id="Vector" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 4.5V6.5" id="Vector_2" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 8.5H6.005" id="Vector_3" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Button26() {
  return (
    <div className="bg-[#ffedd4] h-[26px] relative rounded-[1.67772e+07px] shrink-0 w-[147px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#ffd6a7] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[26px] relative w-[147px]">
        <Icon29 />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[27px] not-italic text-[#ca3500] text-[12px] text-nowrap top-[6px] whitespace-pre">Cardiovascular Risk</p>
      </div>
    </div>
  );
}

function Button27() {
  return (
    <div className="bg-gray-100 h-[26px] relative rounded-[1.67772e+07px] shrink-0 w-[103.852px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[6px] h-[26px] items-center px-[9px] py-[5px] relative w-[103.852px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#364153] text-[12px] text-nowrap whitespace-pre">Recent ER Visit</p>
      </div>
    </div>
  );
}

function Container152() {
  return (
    <div className="basis-0 grow h-[26px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[26px] items-center relative w-full">
        <Button22 />
        <Button23 />
        <Button24 />
        <Button25 />
        <Button26 />
        <Button27 />
      </div>
    </div>
  );
}

function Text15() {
  return (
    <div className="h-[14px] relative shrink-0 w-[136.57px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[14px] items-start relative w-[136.57px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#99a1af] text-[12px] text-nowrap whitespace-pre">Last updated: 2 min ago</p>
      </div>
    </div>
  );
}

function Icon30() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%_12.5%_62.5%_62.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
            <path d="M0.5 0.5H3.5V3.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_12.5%_58.33%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <path d="M4 0.5L0.5 4" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_58.33%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <path d="M0.5 4L4 0.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[62.5%_62.5%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
            <path d="M3.5 3.5H0.5V0.5" id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button28() {
  return (
    <div className="relative rounded-[4px] shrink-0 size-[20px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[4px] px-[4px] relative size-[20px]">
        <Icon30 />
      </div>
    </div>
  );
}

function Container153() {
  return (
    <div className="h-[54px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[24px] h-[54px] items-center justify-center pl-[9px] pr-[24px] py-[24px] relative w-full">
          <Container151 />
          <Container152 />
          <Text15 />
          <Button28 />
        </div>
      </div>
    </div>
  );
}

function KeywordsBar() {
  return (
    <div className="fixed bg-gradient-to-r box-border content-stretch flex flex-col from-[#f9fafb] h-[70px] items-start left-[64px] bottom-0 pb-px pt-[8px] px-[16px] to-[#ffffff] w-[calc(100%-64px)] max-w-[1245px] z-10" data-name="KeywordsBar">
      <div aria-hidden="true" className="absolute border-[#3b3b3b] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Container153 />
    </div>
  );
}

function Group1({ dialogState, panelHeight, handleDragStart }: any) {
  return (
    <div className="absolute contents left-0 top-0">
      <Variant1HomeCollapsed dialogState={dialogState} panelHeight={panelHeight} handleDragStart={handleDragStart} />
      <KeywordsBar />
    </div>
  );
}

function HorizontalInset() {
  return (
    <div className="absolute h-[3px] left-[48px] top-[892px] w-[1263px]" data-name="Horizontal/Inset">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1263 3">
        <g id="Horizontal/Inset">
          <line id="Divider" stroke="var(--stroke-0, #CAC4D0)" x1="16" x2="1263" y1="1.5" y2="1.49989" />
        </g>
      </svg>
    </div>
  );
}

function Group2({ dialogState, panelHeight, handleDragStart }: any) {
  return (
    <div className="absolute contents left-0 top-0">
      <Group1 dialogState={dialogState} panelHeight={panelHeight} handleDragStart={handleDragStart} />
      <HorizontalInset />
    </div>
  );
}

function Container154() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Radiation Treatment</p>
    </div>
  );
}

function Container155() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Jul 10</p>
    </div>
  );
}

function Container156() {
  return (
    <div className="h-[40px] relative shrink-0 w-[48.992px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[40px] items-start relative w-[48.992px]">
        <Container154 />
        <Container155 />
      </div>
    </div>
  );
}

function Container157() {
  return (
    <div className="bg-[#1e2939] h-[24px] relative rounded-[4px] shrink-0 w-[79.242px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[79.242px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[8px] not-italic text-[12px] text-nowrap text-white top-[5px] whitespace-pre">Radiation</p>
      </div>
    </div>
  );
}

function Container158() {
  return (
    <div className="content-stretch flex h-[40px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container156 />
      <Container157 />
    </div>
  );
}

function Container159() {
  return (
    <div className="h-[57px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#364153] text-[12px] top-[10px] w-[218px]">{`Radiation therapy session completed. Targeted treatment to left breast. Patient tolerating well with minimal skin irritation. `}</p>
    </div>
  );
}

function Text16() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-start left-0 top-px w-[48.453px]" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#6a7282] text-[12px]">Reason:</p>
    </div>
  );
}

function Text17() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-start left-[48.45px] top-px w-[132.563px]" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#101828] text-[12px] text-nowrap whitespace-pre">Post-surgical follow-up</p>
    </div>
  );
}

function Container160() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <Text16 />
      <Text17 />
    </div>
  );
}

function TimelineRow20() {
  return (
    <div className="h-[153px] relative shrink-0 w-full" data-name="TimelineRow">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] h-[153px] items-start pb-0 pt-[12px] px-[12px] relative w-full">
          <Container158 />
          <Container159 />
          <Container160 />
        </div>
      </div>
    </div>
  );
}

function PrimitiveDiv() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[155px] items-start left-[623.5px] p-px rounded-[8px] top-[47px] w-[256px]" data-name="Primitive.div">
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <TimelineRow20 />
    </div>
  );
}

export default function Variant1HomeKeywords() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: "", description: "", details: "" });
  const [panelHeight, setPanelHeight] = useState(449);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(449);

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartHeight(panelHeight);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const delta = dragStartY - e.clientY;
    const newHeight = Math.max(70, Math.min(800, dragStartHeight + delta));
    setPanelHeight(newHeight);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, dragStartY, dragStartHeight]);

  return (
    <div className="relative size-full" data-name="Variant 1 / Home / Keywords 1">
      <Group2 dialogState={{ setDialogOpen, setDialogContent }} panelHeight={panelHeight} handleDragStart={handleDragStart} />
      <PrimitiveDiv />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-700">{dialogContent.details}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}