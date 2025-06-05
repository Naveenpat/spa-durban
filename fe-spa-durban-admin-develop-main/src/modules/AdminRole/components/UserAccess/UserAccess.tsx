import React, { useEffect, useState } from 'react';
import accessDataJson from './userAccessData.json';
import { IconCheck } from '@tabler/icons-react';
import ATMCheckbox from '../../../../components/atoms/FormElements/ATMCheckbox/ATMCheckbox';

type Props = {
  selectedUserAccess: string[];
  onSelect: ({
    context,
    data,
    isSelected,
    moduleData,
  }: {
    context: 'module' | 'feature' | 'field';
    data: any;
    isSelected: boolean;
    moduleData?: any;
  }) => void;

  onSelectAll: (features: any[]) => void;
  isAllSelected: (features: any[]) => boolean;
};

const UserAccess = ({
  selectedUserAccess,
  onSelect,
  onSelectAll,
  isAllSelected,
}: Props) => {
  const [selectedModule, setSelectedModule] = useState<any>(null);

  useEffect(() => {
    setSelectedModule(accessDataJson?.accessData?.[0]);
  }, []);

  return (
    <div className="flex h-full border rounded border-neutral-95 ">
      {/* Left Side */}
      <div className="w-[8rem] border-r h-full overflow-auto">
        <ul className="divide-y divide-dashed divide-secondary-80">
          {accessDataJson?.accessData?.map((access) => {
            const isSelected = access.dependencies?.some((dependency) =>
              selectedUserAccess?.includes(dependency),
            );
            const isActive = selectedModule?.moduleName === access?.moduleName;
            return (
              <li
                key={access?.moduleId}
                onClick={() => setSelectedModule(access)}
                className={`flex items-center justify-between gap-2 p-1 px-2 text-xs cursor-pointer ${
                  isActive && 'bg-secondary-98'
                }`}
              >
                {access?.moduleName}
                <div className="flex items-center justify-center size-6 text-success">
                  {isSelected && (
                    <IconCheck strokeWidth={4} className="size-[1rem]" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right Side */}
      <div className="flex-1 h-full p-2 overflow-auto">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          Features{' '}
          <div
            onClick={() => onSelectAll(selectedModule?.features)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ATMCheckbox
              checked={isAllSelected(selectedModule?.features)}
              size="small"
              onChange={() => {
                onSelectAll(selectedModule?.features);
              }}
            />
            Select All
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-2 pb-6 md:flex-row md:flex-wrap md:items-center">
          {selectedModule?.features?.map((feature: any) => {
            const isSelected = selectedUserAccess?.includes(feature?.featureId);
            return (
              <div
                key={feature?.featureId}
                className="flex items-center gap-2 text-xs cursor-pointer selection:bg-none"
                onClick={() => {
                  onSelect({
                    context: 'feature',
                    data: feature,
                    isSelected,
                    moduleData: selectedModule,
                  });
                }}
              >
                <ATMCheckbox
                  checked={isSelected}
                  size="small"
                  onChange={() =>
                    onSelect({
                      context: 'feature',
                      data: feature,
                      isSelected,
                      moduleData: selectedModule,
                    })
                  }
                />
                {feature?.featureName}
              </div>
            );
          })}
        </div>

        {/* TODO: */}
        {/* Fields */}
        {/* <div className="text-sm font-semibold text-slate-700"> Fields</div> */}

        {/* <div className="pt-2 pb-4 ">
          <div className="flex p-2 text-sm bg-gray-100 rounded">
            <div className="flex-[2_2_0%]">Field Name</div> */}

        {/* Read(List) */}
        {/* {selectedUserAccess?.includes(
              selectedModule?.features?.find(
                (el: any) => el?.relatedFieldColumn === "READ_LIST"
              )?.featureId
            ) && <div className="flex-1">Read(List)</div>} */}

        {/* Read(View) */}
        {/* {selectedUserAccess?.includes(
              selectedModule?.features?.find(
                (el: any) => el?.relatedFieldColumn === "READ_VIEW"
              )?.featureId
            ) && <div className="flex-1">Read(View)</div>} */}

        {/* Update */}
        {/* {selectedUserAccess?.includes(
              selectedModule?.features?.find(
                (el: any) => el?.relatedFieldColumn === "UPDATE"
              )?.featureId
            ) && <div className="flex-1">Update</div>}
          </div> */}

        {/* {selectedModule?.fields?.map((field: any, index: number) => {
            return (
              <div key={`${index}`} className="flex p-2">
                <div className="flex-[2_2_0%] text-xs">{field?.fieldName}</div> */}

        {/* Read (List) */}
        {/* {selectedUserAccess?.includes(
                  selectedModule?.features?.find(
                    (el: any) => el?.relatedFieldColumn === "READ_LIST"
                  )?.featureId
                ) && (
                  <div className="flex-1"> 
                    <ATMCheckbox
                      size="small"
                      checked={selectedUserAccess?.includes(
                        field?.fieldId?.READ_LIST
                      )}
                      onChange={() => {
                        onSelect({
                          context: "field",
                          data: field?.fieldId?.READ_LIST,
                          isSelected: selectedUserAccess?.includes(
                            field?.fieldId?.READ_LIST
                          ),
                        });
                      }}
                    />
                  </div>
                )}
                */}

        {/* Read (View) */}
        {/* {selectedUserAccess?.includes(
                  selectedModule?.features?.find(
                    (el: any) => el?.relatedFieldColumn === "READ_VIEW"
                  )?.featureId
                ) && (
                  <div className="flex-1">
                    <ATMCheckbox
                      size="small"
                      checked={selectedUserAccess?.includes(
                        field?.fieldId?.READ_VIEW
                      )}
                      onChange={() => {
                        onSelect({
                          context: "field",
                          data: field?.fieldId?.READ_VIEW,
                          isSelected: selectedUserAccess?.includes(
                            field?.fieldId?.READ_VIEW
                          ),
                        });
                      }}
                    />
                  </div>
                )} */}

        {/* Update */}
        {/* {selectedUserAccess?.includes(
                  selectedModule?.features?.find(
                    (el: any) => el?.relatedFieldColumn === "UPDATE"
                  )?.featureId
                ) && (
                  <div className="flex-1">
                    <ATMCheckbox
                      size="small"
                      checked={selectedUserAccess?.includes(
                        field?.fieldId?.UPDATE
                      )}
                      onChange={() => {
                        onSelect({
                          context: "field",
                          data: field?.fieldId?.UPDATE,
                          isSelected: selectedUserAccess?.includes(
                            field?.fieldId?.UPDATE
                          ),
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })} */}
        {/* </div> */}
      </div>
    </div>
  );
};

export default UserAccess;
