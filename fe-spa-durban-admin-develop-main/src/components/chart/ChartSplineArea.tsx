/**
 * Sample for Area series
 */
import * as React from 'react';
import { useEffect } from 'react';
import { ChartComponent, SeriesCollectionDirective, Highlight, SeriesDirective, ChartTheme, Inject, ILoadedEventArgs, Tooltip, DateTime, SplineAreaSeries, Legend } from '@syncfusion/ej2-react-charts';
import { Browser } from '@syncfusion/ej2-base';
export let data1 = [
    { x: new Date(2002, 0, 1), y: 2.2 }, { x: new Date(2003, 0, 1), y: 3.4 }, { x: new Date(2004, 0, 1), y: 2.8 },
    { x: new Date(2005, 0, 1), y: 1.6 }, { x: new Date(2006, 0, 1), y: 2.3 }, { x: new Date(2007, 0, 1), y: 2.5 },
    { x: new Date(2008, 0, 1), y: 2.9 }, { x: new Date(2009, 0, 1), y: 1.1 }, { x: new Date(2010, 0, 1), y: 1.4 },
    { x: new Date(2011, 0, 1), y: 1.1 }
];
export let data2 = [
    { x: new Date(2002, 0, 1), y: 2 }, { x: new Date(2003, 0, 1), y: 1.7 }, { x: new Date(2004, 0, 1), y: 1.8 },
    { x: new Date(2005, 0, 1), y: 2.1 }, { x: new Date(2006, 0, 1), y: 2.3 }, { x: new Date(2007, 0, 1), y: 1.7 },
    { x: new Date(2008, 0, 1), y: 1.5 }, { x: new Date(2009, 0, 1), y: 0.5 }, { x: new Date(2010, 0, 1), y: 1.5 },
    { x: new Date(2011, 0, 1), y: 1.3 }
];
const SAMPLE_CSS = `
    .control-fluid {
        padding: 0px !important;
    }`;
/**
 * Area sample
 */
const ChartSplineArea = () => {
    const onChartLoad = (args: ILoadedEventArgs): void => {
        let chart: HTMLElement | null = document.getElementById('charts');
        if (chart) {
            chart.setAttribute('title', '');
        }
    };
    const load = (args: ILoadedEventArgs): void => {
        let selectedTheme: string = location.hash.split('/')[1];
        selectedTheme = selectedTheme ? selectedTheme : 'Material';
        args.chart.theme = (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark").replace(/contrast/i,'Contrast').replace(/-highContrast/i, 'HighContrast') as ChartTheme;
    };
    return (
        <div className="control-pane">
            <style>{SAMPLE_CSS}</style>
            <div className="control-section">
                <ChartComponent id="charts" style={{ textAlign: 'center' }} primaryXAxis={{ valueType: 'DateTime', labelFormat: 'y', majorGridLines: { width: 0 }, intervalType: 'Years', minimum: new Date(2001, 0, 1), maximum: new Date(2012, 0, 1), edgeLabelPlacement: 'Shift' }} primaryYAxis={{ labelFormat: '{value}%', lineStyle: { width: 0 }, maximum: 4, interval: 1, majorTickLines: { width: 0 }, minorTickLines: { width: 0 } }} load={load.bind(this)} width={Browser.isDevice ? '100%' : '75%'} legendSettings={{ enableHighlight: true }} chartArea={{ border: { width: 0 } }} title="Inflation Rate in Percentage" loaded={onChartLoad.bind(this)} tooltip={{ enable: true }}>
                    <Inject services={[SplineAreaSeries, DateTime, Tooltip, Legend, Highlight]} />
                    <SeriesCollectionDirective>
                        <SeriesDirective dataSource={data1} xName="x" yName="y" name="US" marker={{ visible: true, isFilled: true, height: 6, width: 6, shape: 'Circle' }} opacity={0.5} type="SplineArea" width={2} border={{ width: 2 }}></SeriesDirective>
                        <SeriesDirective dataSource={data2} xName="x" yName="y" name="France" marker={{ visible: true, isFilled: true, height: 7, width: 7, shape: 'Diamond' }} opacity={0.5} type="SplineArea" width={2} border={{ width: 2 }}></SeriesDirective>
                    </SeriesCollectionDirective>
                </ChartComponent>
            </div>
        </div>
    )    
}
export default ChartSplineArea;