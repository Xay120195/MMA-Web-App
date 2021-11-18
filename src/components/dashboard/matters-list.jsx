import { Link } from 'react-router-dom';
import { AppRoutes } from "../../constants/AppRoutes";

export function MattersList({matter, view}) {

    return view === 'grid' ? (
        <Link to={`${AppRoutes.MATTERSOVERVIEW}/${matter.id}`}>
            <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-5 px-4">
                <div>
                    <h4 tabIndex="0" className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-3">{matter.name}</h4>
                    <p tabIndex="0" className="focus:outline-none text-gray-800 dark:text-gray-100 text-sm">{matter.client.name}</p>
                    <br />
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                            <img className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full" src={matter.substantially_responsible.profile_picture} alt={matter.substantially_responsible.name} title={matter.substantially_responsible.name} />
                        </div>
                        <div className="col-span-2 grid place-self-end">
                            <p tabIndex="0" className="focus:outline-none text-xs text-gray-400">{matter.matter_number}</p>
                        </div>
                    </div>
                </div>
            </div>
        
        </Link>
    ):(
        <Link to={`${AppRoutes.MATTERSOVERVIEW}/${matter.id}`}>
            <div className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 mb-6 py-5 px-4">
                <div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                        <h4 tabIndex="0" className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-1">{matter.name}</h4>
                        <p tabIndex="0" className="focus:outline-none text-xs text-gray-400">{matter.client.name} | {matter.matter_number}</p>
                        </div>
                        <div className="col-span-2 grid place-self-end mb-2">
                        <img className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full" src={matter.substantially_responsible.profile_picture} alt={matter.substantially_responsible.name} title={matter.substantially_responsible.name} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
